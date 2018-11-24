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

exports.getImage = (id) => {
    return db.query(
        `SELECT i.id AS imageId, url, i.username AS imageUser, title, description, to_char(i.created_at, 'DD Mon YYYY HH24:MI:SS') AS imageCreate, comment, c.username AS commentUser, to_char(c.created_at, 'DD Mon YYYY HH24:MI:SS') AS commentCreate, (
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
        FROM images AS i
        LEFT JOIN comments AS c
        ON i.id = c.image_id
        WHERE i.id = $1
        ORDER BY commentCreate DESC`,
        [id]
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
        RETURNING comment, username AS commentUser, to_char(created_at, 'DD Mon YYYY HH24:MI:SS') AS commentCreate`,
        [comment || null, username || null, image_id]
    );
};
