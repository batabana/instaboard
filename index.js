// setup express
const express = require("express");
const app = express();
app.disable("x-powered-by");

// connect to database
const {getImages} = require("./db.js");

// serve static files
app.use(express.static("./public"));

app.get("/images", (req, res) => {
    getImages()
        .then((results) => {
            res.json(results);
        })
        .catch(err => console.log("Error in GET /images: ", err));
});

app.listen(8080, () => console.log("Listening on 8080."));
