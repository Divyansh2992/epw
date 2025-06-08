import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const RAD_TYPES = [
  { key: 'ghr', label: 'GHR', color: '#ff9800', title: 'Global Horizontal Radiation', legend: 'Design Conditions\n(GHR)' },
  { key: 'dnr', label: 'DNR', color: '#1976d2', title: 'Direct Normal Radiation', legend: 'Design Conditions\n(DNR)' },
  { key: 'dhr', label: 'DR', color: '#43a047', title: 'Diffused Horizontal Radiation', legend: 'Design Conditions\n(DR)' },
];

export default function RadiationViolinPlot({ district = 'Ajmer' }) {
  const [data, setData] = useState(null);
  const [radType, setRadType] = useState('ghr');
  const [annualAvg, setAnnualAvg] = useState([null, null, null]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/epw/radiation-monthwise/district/${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        // Calculate annual averages for GHR, DNR, DR
        const avgs = ['ghr', 'dnr', 'dhr'].map(key => {
          const flat = json[key].flat();
          return flat.length ? Math.round(flat.reduce((a, b) => a + b, 0) / flat.length) : '--';
        });
        setAnnualAvg(avgs);
      });
  }, [district]);

  useEffect(() => {
    if (!data) return;
    const radIdx = { ghr: 0, dnr: 1, dhr: 2 }[radType];
    const plotData = data[radType].map((monthArr, i) => ({
      type: 'violin',
      y: monthArr,
      x: Array(monthArr.length).fill(MONTH_LABELS[i]),
      name: MONTH_LABELS[i],
      box: { visible: true },
      meanline: { visible: true },
      line: { color: RAD_TYPES[radIdx].color },
      fillcolor: RAD_TYPES[radIdx].color + '22',
      opacity: 0.7,
      width: 0.7,
      spanmode: 'hard',
      showlegend: false,
      points: 'outliers',
      scalemode: 'count',
    }));
    Plotly.newPlot('radiation-violin-plot', plotData, {
      title: RAD_TYPES[radIdx].title,
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
        title: 'Radiation (Wh/m²)',
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
  }, [data, radType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', background: '#fff', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.2)', padding: 24, minWidth: 900 }}>
      <div style={{ minWidth: 220, marginRight: 32 }}>
        <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>LEGEND</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Select Radiation</div>
        {RAD_TYPES.map((t) => (
          <div key={t.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <input type="radio" id={t.key} name="radType" checked={radType === t.key} onChange={() => setRadType(t.key)} />
            <label htmlFor={t.key} style={{ marginLeft: 8, color: t.color, fontWeight: radType === t.key ? 'bold' : 400 }}>{t.label}</label>
          </div>
        ))}
        <div style={{ fontWeight: 600, margin: '18px 0 6px 0' }}>{RAD_TYPES.find(t => t.key === radType).legend}</div>
        <div style={{ fontSize: 15, marginBottom: 2 }}>GHR = {annualAvg[0]} Wh/m²</div>
        <div style={{ fontSize: 15, marginBottom: 2 }}>DNR = {annualAvg[1]} Wh/m²</div>
        <div style={{ fontSize: 15, marginBottom: 2 }}>DR = {annualAvg[2]} Wh/m²</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 8 }}>Radiation Range</div>
        <div id="radiation-violin-plot" />
      </div>
    </div>
  );
}
