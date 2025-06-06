const express = require('express');
const router = express.Router();
const { validateEpwFilename } = require('../middlewares/epwMiddleware');
const epwController = require('../controllers/epwController');

// Route to fetch raw EPW file data
router.get('/:filename', validateEpwFilename, epwController.getEpwFile);

// Route to fetch weather summary from an EPW file
router.get('/summary/:filename', validateEpwFilename, epwController.getEpwSummary);

module.exports = router;
