const fs = require('fs');
const path = require('path');

// Middleware to validate EPW filename and path
function validateEpwFilename(req, res, next) {
    const filename = req.params.filename;
    const epwDir = path.join(__dirname, '../epw_files');
    const filePath = path.join(epwDir, filename);
    if (!filePath.startsWith(epwDir)) {
        return res.status(400).json({ error: 'Invalid filename' });
    }
    req.epwFilePath = filePath;
    next();
}

module.exports = { validateEpwFilename };
