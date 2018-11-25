var spicedPg = require('spiced-pg');

var db = spicedPg('postgres:postgres:postgres@localhost:5432/imageboard');

exports.getImages = () => {
    return db.query(
        `SELECT *
        FROM images
        ORDER BY id DESC
        LIMIT 4`
    ).then(results => {
        return results.rows;
    });
};

exports.saveImage = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [url, username || null, title || null, description || null]
    );
};

exports.getMoreImages = lastId => {
    return db.query(
        `SELECT *, (
            SELECT MIN(id)
            FROM images
            ) AS last_id
        FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 4`,
        [lastId]
    ).then(results => {
        return results.rows;
    });
};

exports.saveComment = (comment, username, image_id) => {
    return db.query(
        `INSERT INTO comments (comment, username, image_id) VALUES ($1, $2, $3)
        RETURNING comment, username, created_at`,
        [comment || null, username || null, image_id]
    );
};

exports.getImage = (id) => {
    return db.query(
        `SELECT *, (
            SELECT id
            FROM images
            WHERE id > $1
            ORDER BY id ASC
            LIMIT 1
        ) AS next_id, (
            SELECT id
            FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 1
        ) AS prev_id
        FROM images
        WHERE id = $1`,
        [id]
    ).then(results => {
        return results.rows;
    });
};

exports.getComments = (image_id) => {
    return db.query(
        `SELECT *
        FROM comments
        WHERE image_id = $1
        ORDER BY created_at DESC`,
        [image_id]
    ).then(results => {
        return results.rows;
    });
};

exports.getTags = (image_id) => {
    return db.query(
        `SELECT *
        FROM tags
        WHERE image_id = $1`,
        [image_id]
    ).then(results => {
        return results.rows;
    });
};
