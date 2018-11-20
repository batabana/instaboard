// setup express
const express = require("express");
const app = express();
const {getImages, saveImage} = require("./db.js");
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require("./s3.js");
const config = require("./config.json")

app.disable("x-powered-by");

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
        saveImage(url, username, title, description)
            .then(
                res.json({
                    success: true,
                    newImage: {
                        url: url,
                        username: username,
                        title: title,
                        description: description
                    }
                })
            )
            .catch((err) => {
                console.log("error in saveImage: ", err);
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.get("/images", (req, res) => {
    getImages()
        .then((results) => {
            res.json(results);
        })
        .catch(err => console.log("Error in GET /images: ", err));
});

app.listen(8080, () => console.log("Listening on 8080."));
