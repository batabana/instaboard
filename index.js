const express = require("express");
const app = express();
app.disable("x-powered-by");
const db = require("./db.js");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3.js");
const config = require("./config.json");
const bodyParser = require("body-parser");
// tell bodyparser to not ignore json-files
app.use(bodyParser.json());
const moment = require("moment");

// set up file uploading
const diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + "/uploads");
    },
    filename: (req, file, callback) => {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

// serve static files
app.use(express.static("./public"));
app.use(express.static("./uploads"));

// define routes
app.post("/upload", uploader.single("file"), s3.upload, async (req, res) => {
    if (req.file) {
        const { username, title, description } = req.body;
        const url = config.s3Url + req.file.filename;
        try {
            const results = await db.saveImage(url, username, title, description);
            res.json(results);
        } catch (err) {
            console.log("error in saveImage: ", err);
        }
    } else {
        res.json({ success: false });
    }
});

app.get("/images", async (req, res) => {
    try {
        const results = await db.getImages();
        res.json(results);
    } catch (err) {
        console.log("Error in GET /images: ", err);
    }
});

app.get("/image/:id", async (req, res) => {
    const imageId = req.params.id;
    try {
        const image = await db.getImage(imageId);
        if (!image.length) {
            return res.json(image);
        }
        image[0].created_at_rel = moment(image[0].created_at).fromNow();
        image[0].created_at = moment(image[0].created_at).format("MMM Do YYYY, HH:mm:ss");

        const comments = await db.getComments(imageId);
        for (var i = 0; i < comments.length; i++) {
            comments[i].created_at_rel = moment(comments[i].created_at).fromNow();
            comments[i].created_at = moment(comments[i].created_at).format("MMM Do YYYY, HH:mm:ss");
        }

        const tags = await db.getTags(imageId);

        res.json({ image, comments, tags });
    } catch (err) {
        console.log(`Error in GET /image/${imageId}: ${err}`);
    }
});

app.post("/image/:id", async (req, res) => {
    const imageId = req.params.id;
    const { comment, commentUser } = req.body;
    try {
        const results = await db.saveComment(comment, commentUser, imageId);
        results[0].created_at_rel = moment(results[0].created_at).fromNow();
        results[0].created_at = moment(results[0].created_at).format("MMM Do YYYY, HH:mm:ss");
        res.json(results);
    } catch (err) {
        console.log(`Error in POST /image/${imageId}: ${err}`);
    }
});

app.get("/get-more-images/:id", async (req, res) => {
    const lastId = req.params.id;
    try {
        const results = await db.getMoreImages(lastId);
        res.json(results);
    } catch (err) {
        console.log(`Error in GET /get-more-images/${lastId}: ${err}`);
    }
});

app.get("/*", (req, res) => {
    res.redirect("/");
});

app.listen(8080, "127.0.0.1", () => console.log("Listening on 8080."));
