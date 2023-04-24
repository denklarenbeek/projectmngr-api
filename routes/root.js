const express = require('express');
const router = express.Router();
const path = require('path');

// A regex to check if the request is to a URI that start with / (^) ends with the /($) or is to index (where .html is optional ?)
router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
})

router.get('/check', (req, res) => {
    res.json({msg: 'Pong'})
})

module.exports = router;