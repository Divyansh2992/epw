import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TEMP_TYPES = [
  { key: 'dbt', label: 'DBT', color: '#1976d2', title: 'Dry Bulb Temperature', legend: 'Design Conditions\n(cooling DBT)' },
  { key: 'wbt', label: 'WBT', color: '#00bcd4', title: 'Wet Bulb Temperature', legend: 'Design Conditions\n(cooling WBT)' },
  { key: 'dpt', label: 'DPT', color: '#8bc34a', title: 'Dew Point Temperature', legend: 'Design Conditions\n(cooling DPT)' },
];

export default function TemperatureViolinPlot({ district = 'Ajmer' }) {
  const [data, setData] = useState(null);
  const [tempType, setTempType] = useState('dbt');
  const [design, setDesign] = useState([null, null, null]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/epw/temperature-monthwise/district/${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        // Calculate design conditions for DBT, WBT, DPT
        const designConds = ['dbt', 'wbt', 'dpt'].map(key => {
          const flat = json[key].flat().sort((a, b) => b - a);
          return [flat[35], flat[87], flat[175]];
        });
        setDesign(designConds);
      });
  }, [district]);

  useEffect(() => {
    if (!data) return;
    const tempIdx = { dbt: 0, wbt: 1, dpt: 2 }[tempType];
    const plotData = data[tempType].map((monthArr, i) => ({
      type: 'violin',
      y: monthArr,
      x: Array(monthArr.length).fill(MONTH_LABELS[i]),
      name: MONTH_LABELS[i],
      box: { visible: true },
      meanline: { visible: true },
      line: { color: TEMP_TYPES[tempIdx].color },
      fillcolor: TEMP_TYPES[tempIdx].color + '22',
      opacity: 0.7,
      width: 0.7,
      spanmode: 'hard',
      showlegend: false,
      points: 'outliers', // show only outliers for clarity
      scalemode: 'count',
    }));
    Plotly.newPlot('violin-plot', plotData, {
      title: TEMP_TYPES[tempIdx].title,
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
      margin: { l: 60, r: 20, t: 60, b: 60 },
      plot_bgcolor: '#fff',
      paper_bgcolor: '#fff',
      font: { family: 'system-ui', size: 16, color: '#222' },
      width: 900,
      height: 500,
      violingap: 0.1,
      violingroupgap: 0.2,
      violinmode: 'group',
      showlegend: false,
      hovermode: 'x unified',
    }, { displayModeBar: false });
  }, [data, tempType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', background: '#fff', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.2)', padding: 24, minWidth: 900 }}>
      <div style={{ minWidth: 220, marginRight: 32 }}>
        <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>LEGEND</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Select Temperature</div>
        {TEMP_TYPES.map((t, i) => (
          <div key={t.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <input type="radio" id={t.key} name="tempType" checked={tempType === t.key} onChange={() => setTempType(t.key)} />
            <label htmlFor={t.key} style={{ marginLeft: 8, color: t.color, fontWeight: tempType === t.key ? 'bold' : 400 }}>{t.label}</label>
          </div>
        ))}
        <div style={{ fontWeight: 600, margin: '18px 0 6px 0' }}>{TEMP_TYPES.find(t => t.key === tempType).legend}</div>
        <div style={{ fontSize: 15, marginBottom: 2 }}>0.4% = {design[TEMP_TYPES.findIndex(t => t.key === tempType)]?.[0] ?? '--'}°C</div>
        <div style={{ fontSize: 15, marginBottom: 2 }}>1% = {design[TEMP_TYPES.findIndex(t => t.key === tempType)]?.[1] ?? '--'}°C</div>
        <div style={{ fontSize: 15, marginBottom: 2 }}>2% = {design[TEMP_TYPES.findIndex(t => t.key === tempType)]?.[2] ?? '--'}°C</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 8 }}>Temperature Range</div>
        <div id="violin-plot" />
      </div>
    </div>
  );
}
