import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#7ecbff', '#ffb97e', '#7effa1'];

export default function GroundTemperatureLinePlot({ district = 'Ajmer' }) {
  const [data, setData] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/epw/ground-temp/district/${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(json => {
        setData(json.monthlyData);
        setLocation(json.location);
      });
  }, [district]);

  useEffect(() => {
    if (!data) return;
    const trace0 = {
      x: MONTH_LABELS,
      y: data.map(m => m.header_0_5m),
      mode: 'lines+markers',
      name: '0.5 meters',
      line: { color: COLORS[0], width: 3 },
      marker: { color: COLORS[0], size: 8 }
    };
    const trace1 = {
      x: MONTH_LABELS,
      y: data.map(m => m.header_2m),
      mode: 'lines+markers',
      name: '2.0 meters',
      line: { color: COLORS[1], width: 3 },
      marker: { color: COLORS[1], size: 8 }
    };
    const trace2 = {
      x: MONTH_LABELS,
      y: data.map(m => m.header_4m),
      mode: 'lines+markers',
      name: '4.0 meters',
      line: { color: COLORS[2], width: 3 },
      marker: { color: COLORS[2], size: 8 }
    };

    Plotly.newPlot('ground-temp-line-plot', [trace0, trace1, trace2], {
      title: '',
      xaxis: {
        title: 'Month',
        tickvals: MONTH_LABELS,
        ticktext: MONTH_LABELS,
        showgrid: false,
        zeroline: false,
        showline: true,
        linecolor: '#888',
        tickfont: { size: 16 }
      },
      yaxis: {
        title: 'Temperature °C',
        zeroline: false,
        gridcolor: '#e0e0e0',
        tickfont: { size: 16 }
      },
      legend: {
        title: { text: 'DEPTH' },
        font: { size: 16 }
      },
      margin: { l: 60, r: 20, t: 60, b: 60 },
      plot_bgcolor: '#fff',
      paper_bgcolor: '#fff',
      font: { family: 'system-ui', size: 16, color: '#222' },
      width: 900,
      height: 500,
      hovermode: 'x unified',
    }, { displayModeBar: false });
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', background: '#fff', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.2)', padding: 24, minWidth: 900 }}>
      <div style={{ minWidth: 220, marginRight: 32 }}>
        <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>LEGEND</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>DEPTH</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ width: 18, height: 18, background: COLORS[0], borderRadius: 4, marginRight: 10 }} />
            <span style={{ fontSize: 16 }}>0.5 meters</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ width: 18, height: 18, background: COLORS[1], borderRadius: 4, marginRight: 10 }} />
            <span style={{ fontSize: 16 }}>2.0 meters</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ width: 18, height: 18, background: COLORS[2], borderRadius: 4, marginRight: 10 }} />
            <span style={{ fontSize: 16 }}>4.0 meters</span>
          </div>
        </div>
        {location && (
          <div style={{ marginTop: 24, fontSize: 15 }}>
            <div><b>Location:</b> {location.city}, {location.country}</div>
            <div><b>Latitude/Longitude:</b> {location.latitude} / {location.longitude}</div>
            <div><b>Elevation / Time zone:</b> {location.elevation} / {location.timezone}</div>
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 8 }}>Ground Temperature (Monthly Average)</div>
        <div id="ground-temp-line-plot" />
      </div>
    </div>
  );
}