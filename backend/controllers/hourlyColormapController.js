const fs = require('fs');
const path = require('path');

exports.getHourlyColormap = (req, res) => {
  const epwFilePath = req.epwFilePath || path.join(__dirname, '..', 'epw_files', req.params.filename);

  fs.readFile(epwFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    const lines = data.split(/\r?\n/).filter(Boolean);
    if (lines.length <= 8) {
      return res.status(400).json({ error: 'Invalid EPW file' });
    }
    const dataLines = lines.slice(8);

    // Extract dry bulb temperature (dbt) for each hour
    const dbt = dataLines.map(line => {
      const cols = line.split(',');
      return parseFloat(cols[6]); // dbt is at index 6
    });

    // Build 24x365 array: dbt_array[hour][day]
    const dbt_array = [];
    for (let hour = 0; hour < 24; hour++) {
      const dbt_day = [];
      let c = hour;
      for (let day = 0; day < 365; day++) {
        dbt_day.push(dbt[c]);
        c += 24;
      }
      dbt_array.push(dbt_day);
    }

    res.json({ dbt_array });
  });
}; 
