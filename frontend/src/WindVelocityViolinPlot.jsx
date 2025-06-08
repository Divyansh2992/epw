import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist-min';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function WindVelocityViolinPlot({ district = 'Ajmer' }) {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState({ avg: null, max: null });

  useEffect(() => {
    fetch(`http://localhost:3000/api/epw/windv-monthwise/district/${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        // Calculate annual average and max wind velocity
        const flat = json.wv.flat();
        const avg = flat.length ? (flat.reduce((a, b) => a + b, 0) / flat.length).toFixed(1) : '--';
        const max = flat.length ? Math.max(...flat).toFixed(1) : '--';
        setStats({ avg, max });
      });
  }, [district]);

  useEffect(() => {
    if (!data) return;
    const plotData = data.wv.map((monthArr, i) => ({
      type: 'violin',
      y: monthArr,
      x: Array(monthArr.length).fill(MONTH_LABELS[i]),
      name: MONTH_LABELS[i],
      box: { visible: true },
      meanline: { visible: true },
      line: { color: '#1976d2' },
      fillcolor: '#1976d222',
      opacity: 0.7,
      width: 0.7,
      spanmode: 'hard',
      showlegend: false,
      points: 'outliers',
      scalemode: 'count',
    }));
    Plotly.newPlot('wind-violin-plot', plotData, {
      title: 'Wind Velocity Range',
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
        title: 'Velocity m/s',
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
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', background: '#fff', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.2)', padding: 24, minWidth: 900 }}>
      <div style={{ minWidth: 220, marginRight: 32 }}>
        <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16 }}>LEGEND</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Annual Average Wind Velocity</div>
        <div style={{ fontSize: 18, marginBottom: 16 }}>{stats.avg} m/s</div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Annual Maximum Wind Velocity</div>
        <div style={{ fontSize: 18 }}>{stats.max} m/s</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: 28, marginBottom: 8 }}>Wind Velocity Range</div>
        <div id="wind-violin-plot" />
      </div>
    </div>
  );
}
