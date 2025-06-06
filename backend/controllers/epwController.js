const fs = require('fs');

// GET /api/epw/:filename - Return raw EPW file content
exports.getEpwFile = (req, res) => {
    fs.readFile(req.epwFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json({ filename: req.params.filename, data });
    });
};

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
        dataLines.forEach(line => {
            const cols = line.split(',');
            dbt.push(parseFloat(cols[6]));
            dpt.push(parseFloat(cols[7]));
            rh.push(parseFloat(cols[8]));
            wbt.push(parseFloat(cols[9]));
            ghr.push(parseFloat(cols[13]));
            dnr.push(parseFloat(cols[14]));
            dhr.push(parseFloat(cols[15]));
            ghi.push(parseFloat(cols[20]));
            dni.push(parseFloat(cols[21]));
        });
        function safeAvg(arr) {
            const vals = arr.filter(v => !isNaN(v));
            if (!vals.length) return null;
            return vals.reduce((a, b) => a + b, 0) / vals.length;
        }
        function safeMax(arr) {
            const vals = arr.filter(v => !isNaN(v));
            if (!vals.length) return null;
            return Math.max(...vals);
        }
        function safeCountZero(arr) {
            return arr.filter(v => v === 0).length;
        }
        const monthRanges = [
            [0, 744], [744, 1416], [1416, 2160], [2160, 2880], [2880, 3624], [3624, 4344],
            [4344, 5088], [5088, 5832], [5832, 6552], [6552, 7296], [7296, 8016], [8016, 8760]
        ];
        const summary = monthRanges.map(([start, end], i) => {
            return {
                month: i + 1,
                dbt_avg: safeAvg(dbt.slice(start, end)),
                dbt_max: safeMax(dbt.slice(start, end)),
                dpt_avg: safeAvg(dpt.slice(start, end)),
                rh_avg: safeAvg(rh.slice(start, end)),
                wbt_avg: safeAvg(wbt.slice(start, end)),
                dni_avg: safeAvg(dni.slice(start, end)),
                ghi_avg: safeAvg(ghi.slice(start, end)),
                ghr_avg: (() => {
                    const arr = ghr.slice(start, end);
                    return arr.length ? arr.reduce((a, b) => a + b, 0) / (arr.length - safeCountZero(arr)) : null;
                })(),
                dnr_avg: (() => {
                    const arr = dnr.slice(start, end);
                    return arr.length ? arr.reduce((a, b) => a + b, 0) / (arr.length - safeCountZero(arr)) : null;
                })(),
                dhr_avg: (() => {
                    const arr = dhr.slice(start, end);
                    return arr.length ? arr.reduce((a, b) => a + b, 0) / (arr.length - safeCountZero(arr)) : null;
                })(),
                ghr_max: safeMax(ghr.slice(start, end)),
                dnr_max: safeMax(dnr.slice(start, end)),
                dhr_max: safeMax(dhr.slice(start, end)),
            };
        });
        res.json({ filename: req.params.filename, summary });
    });
};
