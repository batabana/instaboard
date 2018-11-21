DROP TABLE IF EXISTS images;

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    url VARCHAR(300) NOT NULL,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO images (url, username, title, description) VALUES (
    'https://s3.amazonaws.com/spicedling/QVMj8paCpYJdqw1swhOmq8KOCcrnkE6r.jpeg',
    'bata',
    'Welcome to Zürich',
    'This photo brings back so many great memories.'
);

INSERT INTO images (url, username, title, description) VALUES (
    'https://s3.amazonaws.com/spicedling/t3pgAiYBFFMlkFydUiugtgjUmZeNPoxa.jpeg',
    'bata',
    'Welcome to Zürich again',
    'This photo brings back so many great memories.'
);
