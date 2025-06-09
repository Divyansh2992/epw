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

// router.post('/wetbulb', (req, res) => {
//     const { dryBulb, relHum, pressure } = req.body;
  
//     if (
//       typeof dryBulb !== 'number' ||
//       typeof relHum !== 'number' ||
//       typeof pressure !== 'number'
//     ) {
//       return res.status(400).json({ error: 'dryBulb, relHum, and pressure are required and must be numbers' });
//     }
  
//     const pythonPath = 'python'; // or 'python3'
//     const scriptPath = path.join(__dirname, '..',  '..','psychrolib.py');
  
//     const process = spawn(pythonPath, [scriptPath, dryBulb.toString(), relHum.toString(), pressure.toString()]);
  
//     let result = '';
//     process.stdout.on('data', (data) => {
//       result += data.toString();
//     });
  
//     process.stderr.on('data', (data) => {
//       console.error(`stderr: ${data}`);
//     });
  
//     process.on('close', (code) => {
//       if (code !== 0) {
//         return res.status(500).json({ error: 'Python script execution failed' });
//       }
  
//       try {
//         const parsed = JSON.parse(result);
//         res.json(parsed);
//       } catch (err) {
//         res.status(500).json({ error: 'Invalid JSON output from Python' });
//       }
//     });
//   });
  
module.exports = router;
