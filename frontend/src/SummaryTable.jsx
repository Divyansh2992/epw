import React from 'react';

const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export default function SummaryTable({ summary, district }) {
  const summaryRows = [
    { label: 'Global Horizontal Radiation (avg. hr.)', key: 'ghr_avg', unit: 'Wh/sq.m' },
    { label: 'Direct Normal Radiation (avg. hr.)', key: 'dnr_avg', unit: 'Wh/sq.m' },
    { label: 'Diffuse Radiation (avg. hr.)', key: 'dhr_avg', unit: 'Wh/sq.m' },
    { label: 'Global Horizontal Radiation (max. hr.)', key: 'ghr_max', unit: 'Wh/sq.m' },
    { label: 'Direct Normal Radiation (max. hr.)', key: 'dnr_max', unit: 'Wh/sq.m' },
    { label: 'Diffuse Radiation (max. hr.)', key: 'dhr_max', unit: 'Wh/sq.m' },
    { label: 'Dry Bulb Temperature (avg. monthly)', key: 'dbt_avg', unit: 'Degree C' },
    { label: 'Dry Bulb Temperature (max.)', key: 'dbt_max', unit: 'Degree C' },
    { label: 'Relative Humidity (avg. monthly)', key: 'rh_avg', unit: 'Percent' },
    { label: 'Wet Bulb Temperature (avg. monthly)', key: 'wbt_avg', unit: 'Degree C' },
    { label: 'Dew Point Temperature (avg. monthly)', key: 'dpt_avg', unit: 'Degree C' },
    { label: 'Global Horizontal Illumination (avg. hr.)', key: 'ghi_avg', unit: 'Lux' },
    { label: 'Direct Normal Illumination (avg. hr.)', key: 'dni_avg', unit: 'Lux' },
  ];

  return (
    <div style={{overflowX:'auto'}}>
      <h2 style={{marginTop:0}}>Weather File Summary</h2>
      <div style={{fontWeight:'bold',marginBottom:8}}>District: {district}</div>
      <table style={{borderCollapse:'collapse', width:'100%', fontSize:14}}>
        <thead>
          <tr>
            <th style={{border:'1px solid #aaa',padding:'4px 8px',background:'#e6e6e6'}}>MONTHLY MEANS</th>
            <th style={{border:'1px solid #aaa',padding:'4px 8px',background:'#e6e6e6'}}>Unit</th>
            {summary.map((m, i) => (
              <th key={i} style={{border:'1px solid #aaa',padding:'4px 8px',background:'#f5f5f5'}}>{months[i]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summaryRows.map(row => (
            <tr key={row.key}>
              <td style={{border:'1px solid #aaa',padding:'4px 8px',fontWeight:'bold'}}>{row.label}</td>
              <td style={{border:'1px solid #aaa',padding:'4px 8px'}}>{row.unit}</td>
              {summary.map((m, i) => (
                <td key={i} style={{border:'1px solid #aaa',padding:'4px 8px',textAlign:'center'}}>
                  {typeof m[row.key] === 'number' && !isNaN(m[row.key]) ? m[row.key].toFixed(2) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
