const fs = require('fs');
const path = require('path');

// GET /api/epw/summary/:filename - Return weather summary
exports.getEpwSummary = (req, res) => {
    fs.readFile(req.epwFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }

        const lines = data.split(/\r?\n/).filter(Boolean);
        if (lines.length <= 8) {
            return res.status(400).json({ error: 'Invalid EPW file' });
        }

        const dataLines = lines.slice(8);
        const dbt = [], rh = [], dpt = [], wbt = [], ghr = [], dnr = [], dhr = [], ghi = [], dni = [];

        // Extract values from data lines
        for (const line of dataLines) {
            const cols = line.split(',');
            if (cols.length < 22) continue;
            dbt.push(parseFloat(cols[6]));   // Dry bulb temperature (°C)
            dpt.push(parseFloat(cols[7]));   // Dew point temperature (°C)
            rh.push(parseFloat(cols[8]));    // Relative humidity (%)
            ghr.push(parseFloat(cols[13]));  // Global horizontal radiation (Wh/m2)
            dnr.push(parseFloat(cols[14]));  // Direct normal radiation (Wh/m2)
            dhr.push(parseFloat(cols[15]));  // Diffuse horizontal radiation (Wh/m2)
            dni.push(parseFloat(cols[16]));  // Direct normal illuminance (lux)
            ghi.push(parseFloat(cols[17]));  // Global horizontal illuminance (lux)
        }
        // Calculate pressure from elevation (header line)
        let press = 101325; // default sea level
        if (lines[0]) {
            const header = lines[0].split(',');
            if (header.length > 9) {
                const elevation = parseFloat(header[9]);
                if (!isNaN(elevation)) {
                    // Standard atmosphere pressure formula (in Pa)
                    press = 101325 * Math.pow(1 - 2.25577e-5 * elevation, 5.25588);
                }
            }
        }
        function calcWBT(dbt, rh) {
            // Stull formula (approximate, valid for 0°C < dbt < 50°C, 1% < rh < 100%)
            // dbt in °C, rh in %, p in Pa
            if (isNaN(dbt) || isNaN(rh) ) return NaN;
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

        const monthLengths = [744, 672, 744, 720, 744, 720, 744, 744, 720, 744, 720, 744];
        let start = 0;
        const summary = monthLengths.map((length, i) => {
            const end = start + length;
            const slice = arr => arr.slice(start, end);
            const avg = arr => arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null;
            const max = arr => arr.length ? Number(Math.max(...arr).toFixed(2)) : null;
            const avgNonZero = arr => {
                const nonZero = arr.filter(v => v !== 0);
                return nonZero.length ? Number((nonZero.reduce((a, b) => a + b, 0) / nonZero.length).toFixed(2)) : null;
            };

            const result = {
                month: i + 1,
                dbt_avg: avg(slice(dbt)),
                dbt_max: max(slice(dbt)),
                dpt_avg: avg(slice(dpt)),
                rh_avg: avg(slice(rh)),
                wbt_avg: avg(slice(wbt)),
                ghi_avg: avg(slice(ghi)), 
                dni_avg: avg(slice(dni)),
                ghr_avg: avgNonZero(slice(ghr)), 
                dnr_avg: avgNonZero(slice(dnr)), 
                dhr_avg: avgNonZero(slice(dhr)),
                ghr_max: max(slice(ghr)),
                dnr_max: max(slice(dnr)),
                dhr_max: max(slice(dhr)),
                ghi_max: max(slice(ghi)),
                dni_max: max(slice(dni)),
            };

            start = end;
            return result;
        });

        res.json({ filename: req.params.filename, summary });
    });
};
