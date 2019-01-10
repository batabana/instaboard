const knox = require('knox');
const fs = require('fs');

// authenticate to AWS
let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // secrets.json is in .gitignore
}

const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'spicedling'
});

// middleware function to upload new pictures
exports.upload = (req, res, next) => {
    if (!req.file) {
        return res.sendStatus(500);
    }

    // configuration for AWS, set headers
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });

    // send data to AWS
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    // response from AWS
    s3Request.on('response', s3Response => {
        const wasSuccessful = s3Response.statusCode == 200;
        if (wasSuccessful) {
            next();
        } else {
            res.sendStatus(500);
        }
    });
};
