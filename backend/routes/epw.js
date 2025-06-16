const express = require('express');
const router = express.Router();
const path = require('path');
const { validateEpwFilename, resolveEpwByDistrict } = require('../middlewares/epwMiddleware');
const epwController = require('../controllers/epwController');
const windController = require('../controllers/windController');
const summaryController = require('../controllers/summaryController');
const temperatureController = require('../controllers/temperatureController');
const radiationController = require('../controllers/radiationController');
const groundTempController = require('../controllers/groundTempController');
const hourlyColormapController = require('../controllers/hourlyColormapController');
const { getDesignConditions } = require('../controllers/designConditionsController');

const { spawn } = require('child_process');

// Middleware to set EPW file path
const setEpwFilePath = (req, res, next) => {
    req.epwFilePath = path.join(__dirname, '..', 'epw_files', req.params.filename);
    next();
};

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

// Route to fetch ground temperature data by district name
router.get('/ground-temp/district/:district', resolveEpwByDistrict, (req, res) => {
    req.params.filename = req.epwResolvedFilename;
    groundTempController.getGroundTempData(req, res);
});

router.get('/hourly-colormap/district/:district', resolveEpwByDistrict, (req, res) => {
    req.params.filename = req.epwResolvedFilename;
    hourlyColormapController.getHourlyColormap(req, res);
});

// Route to fetch design conditions by city
router.get('/design-conditions/:city', getDesignConditions);

module.exports = router;
