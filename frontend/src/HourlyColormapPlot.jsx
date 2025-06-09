import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const HOUR_LABELS = [
  '12 a.m.', '1 a.m.', '2 a.m.', '3 a.m.', '4 a.m.', '5 a.m.', '6 a.m.', '7 a.m.', '8 a.m.', '9 a.m.', '10 a.m.', '11 a.m.',
  '12 p.m.', '1 p.m.', '2 p.m.', '3 p.m.', '4 p.m.', '5 p.m.', '6 p.m.', '7 p.m.', '8 p.m.', '9 p.m.', '10 p.m.', '11 p.m.'
];

export default function HourlyColormapPlot({ district = 'Jaipur-Sanganer' }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/epw/hourly-colormap/district/${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(json => setData(json.dbt_array));
  }, [district]);

  useEffect(() => {
    if (!data) return;

    // X axis: 365 days, but we want to show months as minor ticks
    const xTicks = [];
    const xTickLabels = [];
    for (let i = 0; i < 12; i++) {
      xTicks.push(i * 30.4166 + 15.5); // Middle of each month
      xTickLabels.push(MONTH_LABELS[i]);
    }

    Plotly.newPlot('hourly-colormap-plot', [{
      z: data,
      type: 'heatmap',
      colorscale: [
        [0, '#0033a0'],    // < 15°C deep blue
        [0.25, '#7ecbff'], // 15-25°C light blue
        [0.5, '#fff'],     // 25°C white
        [0.75, '#ffb3b3'], // 25-35°C lighter red
        [1, '#ff6666']     // > 35°C lighter red
      ],
      zmin: 5,
      zmax: 40,
      colorbar: {
        title: '°C',
        tickvals: [5, 15, 25, 35, 40],
        ticktext: ['5°C', '15°C', '25°C', '35°C', '40°C'],
        len: 0.8,
        thickness: 18,
        y: 0.5,
        yanchor: 'middle'
      }
    }], {
      title: '',
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
          '12 a.m.','2 a.m.','4 a.m.','6 a.m.','8 a.m.','10 a.m.',
          '12 p.m.','2 p.m.','4 p.m.','6 p.m.','8 p.m.','10 p.m.'
        ],
        autorange: false,
        range: [0, 23],
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
    }, { displayModeBar: false });
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', background: '#fff', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.2)', padding: 24, minWidth: 900 }}>
      <div style={{ minWidth: 260, marginRight: 32 }}>
        <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>LEGEND</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Temperature Range</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 32, height: 24, background: '#0033a0', marginRight: 10 }} />
            <span style={{ fontSize: 16 }}>&lt; 15°C</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 32, height: 24, background: '#7ecbff', marginRight: 10 }} />
            <span style={{ fontSize: 16 }}>&gt; 15°C and &lt; 25°C</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 32, height: 24, background: '#ff7e7e', marginRight: 10 }} />
            <span style={{ fontSize: 16 }}>&gt; 25°C and &lt; 35°C</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 32, height: 24, background: '#b30000', marginRight: 10 }} />
            <span style={{ fontSize: 16 }}>&gt; 35°C</span>
          </div>
        </div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Colormap</div>
        <div style={{ fontSize: 14, color: '#333' }}>
          A colormap is matrix that define the colors for graphics objects by mapping data values to colors in colormap.
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 8 }}>Hourly Colormap (DBT)</div>
        <div id="hourly-colormap-plot" />
      </div>
    </div>
  );
}