const fs = require('fs');
const path = require('path');
// GET /api/epw/:filename - Return raw EPW file content
exports.getEpwFile = (req, res) => {
    fs.readFile(req.epwFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json({ filename: req.params.filename, data });
    });
};






