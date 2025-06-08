const express = require('express');
const router = express.Router();
const { validateEpwFilename, resolveEpwByDistrict } = require('../middlewares/epwMiddleware');
const epwController = require('../controllers/epwController');
const windController = require('../controllers/windController');
const summaryController = require('../controllers/summaryController');
const temperatureController = require('../controllers/temperatureController');
const radiationController = require('../controllers/radiationController');

// Route to fetch raw EPW file data by district name
router.get('/district/:district', resolveEpwByDistrict, (req, res) => {
    req.params.filename = req.epwResolvedFilename;
    epwController.getEpwFile(req, res);
});

// Route to fetch weather summary from an EPW file by district name
router.get('/summary/district/:district', resolveEpwByDistrict, (req, res) => {
    req.params.filename = req.epwResolvedFilename;
    summaryController.getEpwSummary(req, res);
});

// Route to fetch monthwise temperature arrays by district name
router.get('/temperature-monthwise/district/:district', resolveEpwByDistrict, (req, res) => {
    req.params.filename = req.epwResolvedFilename;
    temperatureController.getTemperatureMonthwise(req, res);
});

// Route to fetch monthwise radiation arrays by district name
router.get('/radiation-monthwise/district/:district', resolveEpwByDistrict, (req, res) => {
    req.params.filename = req.epwResolvedFilename;
    radiationController.getRadiationMonthwise(req, res);
});

// Route to fetch monthwise wind velocity arrays by district name
router.get('/windv-monthwise/district/:district', resolveEpwByDistrict, (req, res) => {
    req.params.filename = req.epwResolvedFilename;
    windController.getWindVelocityMonthwise(req, res);
});

module.exports = router;
