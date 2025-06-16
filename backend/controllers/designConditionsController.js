const XLSX = require('xlsx');
const path = require('path');

const getDesignConditions = (req, res) => {
    try {
        const { city } = req.params;
        
        // Read the Excel file
        const workbook = XLSX.readFile(path.join(__dirname, '../design_conditions.xlsx'));
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON, starting from row 3 (index 2) for headers
        const data = XLSX.utils.sheet_to_json(worksheet, { range: 2 });
        
        // Log the keys of the first data object to verify column names
        if (data.length > 0) {
            console.log('Keys of the first parsed data object:', Object.keys(data[0]));
        }

        console.log('Parsed Excel data:', data);
        
        // Find the city data
        const cityData = data.find(row => {
            // Check for both 'City' (if present) or '__EMPTY' (if xlsx assigned it)
            const cityNameInRow = row.City || row.__EMPTY;
            console.log(`Checking city: ${cityNameInRow} against ${city}`);
            return cityNameInRow && cityNameInRow.toLowerCase().trim() === city.toLowerCase().trim();
        });
        
        if (!cityData) {
            return res.status(404).json({ 
                error: 'City not found',
                message: `No design conditions found for city: ${city}`
            });
        }
        
        const responseData = {
            city: (cityData.City || cityData.__EMPTY).trim(), // Return the trimmed city name
            designConditions: {
                Heating: {
                    "99.60%": {
                        dryBulb: cityData['DBT'], 
                        wetBulb: cityData['MCWB']
                    },
                    "99.00%": {
                        dryBulb: cityData['DBT_1'], 
                        wetBulb: cityData['MCWB_1']
                    }
                },
                Cooling: {
                    "Peak": {
                        dryBulb: cityData['DBT_2'], 
                        wetBulb: cityData['MCWB_2']
                    },
                    "0.40%": {
                        dryBulb: cityData['DBT_3'], 
                        wetBulb: cityData['MCWB_3']
                    },
                    "1.00%": {
                        dryBulb: cityData['DBT_4'], 
                        wetBulb: cityData['MCWB_4']
                    },
                    "2.00%": {
                        dryBulb: cityData['DBT_5'], 
                        wetBulb: cityData['MCWB_5']
                    }
                },
                Evaporation: {
                    "Peak": {
                        wetBulb: cityData['WB'], 
                        meanCoincidentDryBulb: cityData['MCDB']
                    },
                    "0.40%": {
                        wetBulb: cityData['WB_1'], 
                        meanCoincidentDryBulb: cityData['MCDB_1']
                    },
                    "1.00%": {
                        wetBulb: cityData['WB_2'], 
                        meanCoincidentDryBulb: cityData['MCDB_2']
                    },
                    "2.00%": {
                        wetBulb: cityData['WB_3'], 
                        meanCoincidentDryBulb: cityData['MCDB_3']
                    }
                }
            }
        };

        // Log the response data to the console
        console.log('API Response Data:', JSON.stringify(responseData, null, 2));
        
        // Return the city data
        res.json(responseData);
        
    } catch (error) {
        console.error('Error reading design conditions:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to read design conditions data'
        });
    }
};

module.exports = {
    getDesignConditions
}; 