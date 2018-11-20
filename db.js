var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:postgres:postgres@localhost:5432/imageboard');

exports.getImages = () => {
    return db.query(
        `SELECT *
        FROM images
        ORDER BY created_at DESC
        LIMIT 12`
    );
};

exports.saveImage = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4)`,
        [url, username || null, title || null, description || null]
    );
};
