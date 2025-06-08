const fs = require('fs');

// GET /api/epw/temperature-monthwise/:filename - Return monthwise temperature arrays for plotting
exports.getTemperatureMonthwise = (req, res) => {
    const filePath = req.epwFilePath;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        const lines = data.split(/\r?\n/).filter(Boolean);
        if (lines.length <= 8) {
            return res.status(400).json({ error: 'Invalid EPW file' });
        }
        const dataLines = lines.slice(8);
        const dbt = [], dpt = [], wbt = [], rh = [];
        for (const line of dataLines) {
            const cols = line.split(',');
            if (cols.length < 22) continue;
            dbt.push(parseFloat(cols[6]));   // Dry bulb temperature (°C)
            dpt.push(parseFloat(cols[7]));   // Dew point temperature (°C)
            rh.push(parseFloat(cols[8]));    // Relative humidity (%)
        }
        // Calculate WBT using Stull formula
        let press = 101325;
        if (lines[0]) {
            const header = lines[0].split(',');
            if (header.length > 9) {
                const elevation = parseFloat(header[9]);
                if (!isNaN(elevation)) {
                    press = 101325 * Math.pow(1 - 2.25577e-5 * elevation, 5.25588);
                }
            }
        }
        function calcWBT(dbt, rh) {
            if (isNaN(dbt) || isNaN(rh)) return NaN;
            const es = 6.112 * Math.exp((17.62 * dbt) / (243.12 + dbt));
            const e = rh / 100 * es;
            const wbt = dbt * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
                Math.atan(dbt + rh) - Math.atan(rh - 1.676331) +
                0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
            return Math.round(wbt * 10) / 10;
        }
        for (let i = 0; i < dbt.length; i++) {
            wbt.push(calcWBT(dbt[i], rh[i]));
        }
        // Month slicing
        const monthLengths = [744, 672, 744, 720, 744, 720, 744, 744, 720, 744, 720, 744];
        let start = 0;
        const dbtMonth = [], wbtMonth = [], dptMonth = [];
        for (let m = 0; m < 12; m++) {
            const end = start + monthLengths[m];
            dbtMonth.push(dbt.slice(start, end));
            wbtMonth.push(wbt.slice(start, end));
            dptMonth.push(dpt.slice(start, end));
            start = end;
        }
        res.json({ dbt: dbtMonth, wbt: wbtMonth, dpt: dptMonth });
    });
};
