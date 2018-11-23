// setup express
const express = require("express");
const app = express();
app.disable("x-powered-by");
const db = require("./db.js");
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require("./s3.js");
const config = require("./config.json");
const bodyParser = require("body-parser");
// tell bodyparser to not ignore json-files
app.use(bodyParser.json());

// set up file uploading
const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
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
app.post('/upload', uploader.single('file'), s3.upload, function(req, res) {
    if (req.file) {
        const {username, title, description} = req.body;
        const url = config.s3Url + req.file.filename;
        db.saveImage(url, username, title, description)
            .then(results => {
                res.json(results);
            })
            .catch(err => console.log("error in saveImage: ", err));
    } else {
        res.json({
            success: false
        });
    }
});

app.get("/images", (req, res) => {
    db.getImages()
        .then(results => {
            res.json(results);
        })
        .catch(err => console.log("Error in GET /images: ", err));
});

app.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    db.getImage(imageId)
        .then(results => {
            res.json(results);
        })
        .catch(err => console.log(`Error in GET /image/${imageId}: ${err}`));
});

app.post("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const {comment, commentUser} = req.body;
    db.saveComment(comment, commentUser, imageId)
        .then(results => {
            res.json({
                success: true,
                results
            });
        })
        .catch(err => console.log(`Error in POST /image/${imageId}: ${err}`));
});

app.get("/get-more-images/:id", (req, res) => {
    const lastId = req.params.id;
    db.getMoreImages(lastId)
        .then(results => {
            res.json(results);
        })
        .catch(err => console.log(`Error in GET /get-more-images/${lastId}: ${err}`));
});

app.listen(8080, () => console.log("Listening on 8080."));
