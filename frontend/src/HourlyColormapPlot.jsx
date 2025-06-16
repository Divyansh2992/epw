import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const HOUR_LABELS = [
  '0 a.m.', '1 a.m.', '2 a.m.', '3 a.m.', '4 a.m.', '5 a.m.', '6 a.m.', '7 a.m.', '8 a.m.', '9 a.m.', '10 a.m.', '11 a.m.',
  '12 p.m.', '1 p.m.', '2 p.m.', '3 p.m.', '4 p.m.', '5 p.m.', '6 p.m.', '7 p.m.', '8 p.m.', '9 p.m.', '10 p.m.', '11 p.m.'
];

const COLORMAP_CONFIGS = {
  dbt: {
    title: 'Dry Bulb Temperature (°C)',
    unit: '°C',
    zmin: 5,
    zmax: 40,
    colorscale: [
      [0, '#0033a0'],    // < 15°C deep blue
      [0.25, '#7ecbff'], // 15-25°C light blue
      [0.5, '#fff'],     // 25°C white
      [0.75, '#ffb3b3'], // 25-35°C lighter red
      [1, '#ff6666']     // > 35°C lighter red
    ],
    legendRanges: [
      { color: '#0033a0', label: '< 15°C' },
      { color: '#7ecbff', label: '> 15°C and < 25°C' },
      { color: '#ffb3b3', label: '> 25°C and < 35°C' },
      { color: '#ff6666', label: '> 35°C' }
    ]
  },
  wbt: {
    title: 'Wet Bulb Temperature (°C)',
    unit: '°C',
    zmin: 0,
    zmax: 35,
    colorscale: [
      [0, '#0033a0'],    // < 10°C deep blue
      [0.28, '#7ecbff'], // 10-20°C light blue
      [0.05, '#fff'],     // 20°C white
      [0.57, '#ffb3b3'], // 20-30°C lighter red
      [1, '#ff6666']     // > 30°C lighter red
    ],
    legendRanges: [
      { color: '#0033a0', label: '< 10°C' },
      { color: '#7ecbff', label: '> 10°C and < 20°C' },
      { color: '#ffb3b3', label: '> 20°C and < 30°C' },
      { color: '#ff6666', label: '> 30°C' }
    ]
  },
  dpt: {
    title: 'Dew Point Temperature (°C)',
    unit: '°C',
    zmin: -10,
    zmax: 30,
    colorscale: [
      [0, '#0033a0'],    // < 0°C deep blue
      [0.25, '#7ecbff'], // 0-10°C light blue
      [0.5, '#fff'],     // 10-20°C white
      [0.75, '#ffb3b3'], // 20-25°C lighter red
      [1, '#ff6666']     // > 25°C lighter red
    ],
    legendRanges: [
      { color: '#0033a0', label: '< 0°C' },
      { color: '#7ecbff', label: '> 0°C and < 10°C' },
      { color: '#ffb3b3', label: '> 10°C and < 20°C' },
      { color: '#ff6666', label: '> 20°C' }
    ]
  },
  rh: {
    title: 'Relative Humidity (%)',
    unit: '%',
    zmin: 0,
    zmax: 100,
    colorscale: [
      [0, '#ffffcc'],    // < 20% light yellow
      [0.2, '#a1dab4'],  // 20-40% light green
      [0.4, '#41b6c4'],  // 40-60% light blue
      [0.6, '#2c7fb8'],  // 60-80% medium blue
      [0.8, '#253494'],  // 80-100% deep blue
      [1, '#081d58']      // > 90% very deep blue
    ],
    legendRanges: [
      { color: '#ffffcc', label: '< 20%' },
      { color: '#a1dab4', label: '> 20% and < 40%' },
      { color: '#41b6c4', label: '> 40% and < 60%' },
      { color: '#2c7fb8', label: '> 60% and < 80%' },
      { color: '#253494', label: '> 80% and < 100%' }
    ]
  }
};

export default function HourlyColormapPlot({ district = 'Jaipur-Sanganer' }) {
  const [data, setData] = useState(null);
  const [selectedType, setSelectedType] = useState('dbt'); // New state for selected colormap type

  useEffect(() => {
    fetch(`http://localhost:3000/api/epw/hourly-colormap/district/${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(json => setData(json)); // Store the entire JSON response (dbt_array, wbt_array, etc.)
  }, [district]);

  useEffect(() => {
    if (!data) return;

    const config = COLORMAP_CONFIGS[selectedType]; // Get config based on selected type

    // X axis: 365 days, but we want to show months as minor ticks
    const xTicks = [];
    const xTickLabels = [];
    for (let i = 0; i < 12; i++) {
      xTicks.push(i * 30.4166 + 15.5); // Middle of each month
      xTickLabels.push(MONTH_LABELS[i]);
    }

    Plotly.newPlot('hourly-colormap-plot', [{
      z: data[`${selectedType}_array`], // Use selected data array
      type: 'heatmap',
      colorscale: config.colorscale,
      zmin: config.zmin,
      zmax: config.zmax,
      colorbar: {
        title: config.unit,
        tickvals: config.legendRanges.map((_, i) => config.zmin + (config.zmax - config.zmin) / (config.legendRanges.length) * i),
        ticktext: config.legendRanges.map(range => range.label),
        len: 0.8,
        thickness: 18,
        y: 0.5,
        yanchor: 'middle'
      }
    }], {
      title: config.title, // Use dynamic title
      xaxis: {
        title: '',
        showgrid: false,
        zeroline: false,
        showline: true,
        linecolor: '#888',
        tickvals: xTicks,
        ticktext: xTickLabels,
        ticks: '',
        tickfont: { size: 16 }
      },
      yaxis: {
        title: 'Hour',
        showgrid: false,
        zeroline: false,
        showline: true,
        linecolor: '#888',
        tickvals: [0,2,4,6,8,10,12,14,16,18,20,22],
        ticktext: [
          '0 a.m.','2 a.m.','4 a.m.','6 a.m.','8 a.m.','10 a.m.',
          '12 p.m.','2 p.m.','4 p.m.','6 p.m.','8 p.m.','10 p.m.'
        ],
        autorange: false,
        range: [-0.5, 23.5],
        tickfont: { size: 16 }
      },
      margin: { l: 80, r: 40, t: 40, b: 60 },
      plot_bgcolor: '#fff',
      paper_bgcolor: '#fff',
      font: { family: 'system-ui', size: 16, color: '#222' },
      width: 900,
      height: 500,
      hovermode: false,
      showlegend: false
    }, { displayModeBar: true });
  }, [data, selectedType]); // Re-render when data or selectedType changes

  return (
    <div style={{ display: 'flex', flexDirection: 'row', background: '#fff', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.2)', padding: 24, minWidth: 900 }}>
      <div style={{ minWidth: 260, marginRight: 32 }}>
        <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>COLOURMAP TYPE</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Select Colormap</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {Object.keys(COLORMAP_CONFIGS).map(key => (
            <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id={key}
                name="colormapType"
                value={key}
                checked={selectedType === key}
                onChange={() => setSelectedType(key)}
              />
              <label htmlFor={key} style={{ marginLeft: 8, fontSize: 16, fontWeight: selectedType === key ? 'bold' : 'normal' }}>
                {COLORMAP_CONFIGS[key].title.split(' ')[0]} {/* Display only the first word (e.g., Dry, Wet, Dew, Relative) */}
              </label>
            </div>
          ))}
        </div>
        
        {/* Dynamic Legend Display */}
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{COLORMAP_CONFIGS[selectedType].title} Ranges</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {COLORMAP_CONFIGS[selectedType].legendRanges.map((range, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 32, height: 24, background: range.color, marginRight: 10 }} />
              <span style={{ fontSize: 16 }}>{range.label}</span>
            </div>
          ))}
        </div>

        <div style={{ fontWeight: 600, marginBottom: 4 }}>Colormap</div>
        <div style={{ fontSize: 14, color: '#333' }}>
          A colormap is a matrix that defines the colors for graphics objects by mapping data values to colors in the colormap.
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 8 }}>Hourly Colormap ({COLORMAP_CONFIGS[selectedType].title})</div>
        <div id="hourly-colormap-plot" />
      </div>
    </div>
  );
}