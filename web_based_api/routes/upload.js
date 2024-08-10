const express = require('express');
const { upload } = require('../database/multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.post('/upload', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: 'File upload failed', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = path.join(__dirname, '../uploadfile', req.file.filename);
        
        res.json({ message: 'File uploaded successfully', filePath });
    });
});


router.get('/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploadfile', req.params.filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.sendFile(filePath);
    });
});

module.exports = router;
