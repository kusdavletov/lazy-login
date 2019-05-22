const autologin = require('../utils/autologin');
const logger = require('../utils/logger');
const express = require('express');
const request = require('request');

const router = express.Router();

router.post('/', (req, res) => {
    logger(`Received new request for ${req.body.url}`);

    if (!req.body.url || !req.body.username || !req.body.password) {
        logger('Some parameters are missing');
        res.status(400).json({ message: 'Please fill required parameters' });
    }

    request(req.body.url, function (error, response) {
        if (error || response.statusCode !== 200) {
            logger('Invalid URL was provided');
            res.status(400).json({ message: 'Invalid URL' });
        }
    });

    autologin(req.body.url, req.body.username, req.body.password)
        .then((postInfo) => {
            logger('The request has been processed successfully');
            res.status(200).json({ postInfo: postInfo });
        })
        .catch((error) => {
            logger(`Some error has been occurred ${error}`);
            res.status(500).json({ message: 'Some error has been occurred' })
        });
});

module.exports = router;