var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/imageboard");

exports.getImages = async () => {
    const query = `
        SELECT * 
        FROM images 
        ORDER BY id DESC 
        LIMIT 4
    `;
    const { rows } = await db.query(query);
    return rows;
};

exports.saveImage = async (url, username, title, description) => {
    const query = `
        INSERT INTO images (url, username, title, description) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
    `;
    const { rows } = await db.query(query, [
        url,
        username || null,
        title || null,
        description || null
    ]);
    return rows;
};

exports.getMoreImages = async lastId => {
    const query = `
        SELECT *, (
            SELECT MIN(id)
            FROM images
            ) AS last_id
        FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 4
    `;
    const { rows } = await db.query(query, [lastId]);
    return rows;
};

exports.saveComment = async (comment, username, image_id) => {
    const query = `
        INSERT INTO comments (comment, username, image_id)
        VALUES ($1, $2, $3)
        RETURNING comment, username, created_at
    `;
    const { rows } = await db.query(query, [comment || null, username || null, image_id]);
    return rows;
};

exports.getImage = async id => {
    const query = `
        SELECT *, (
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
        WHERE id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows;
};

exports.getComments = async image_id => {
    const query = `
        SELECT * 
        FROM comments 
        WHERE image_id = $1 
        ORDER BY created_at 
        DESC
    `;
    const { rows } = await db.query(query, [image_id]);
    return rows;
};

exports.getTags = async image_id => {
    const query = `
        SELECT * 
        FROM tags 
        WHERE image_id = $1
    `;
    const { rows } = await db.query(query, [image_id]);
    return rows;
};
