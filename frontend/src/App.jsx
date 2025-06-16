import React, { useState } from 'react';
import SummaryTable from './SummaryTable';
import IndiaMap from './IndiaMap';
import TemperatureViolinPlot from './TemperatureViolinPlot';
import RadiationViolinPlot from './RadiationViolinPlot';
import WindVelocityViolinPlot from './WindVelocityViolinPlot';
import GroundTemperatureLinePlot from './GroundTemperatureLinePlot';
import HourlyColormapPlot from './HourlyColormapPlot';

function App() {
  const [popup, setPopup] = useState({ visible: false, district: '', summary: null });
  const [activeTab, setActiveTab] = useState('summary');
  const [activeSubTab, setActiveSubTab] = useState('temperature');
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [designConditions, setDesignConditions] = useState(null);

  const handleDistrictClick = (district) => {
    fetch(`/api/epw/summary/district/${encodeURIComponent(district)}`)
      .then(async res => {
        if (!res.ok) {
          throw new Error('Not found');
        }
        const data = await res.json();
        if (!data.summary) {
          throw new Error('No summary');
        }
        setPopup({ visible: true, district, summary: data.summary });
      })
      .catch((err) => {
        console.error('EPW fetch error:', err);
        setPopup({ visible: true, district, summary: null });
      });
  };

  const handleDistrictHover = (districtName) => {
    setHoveredDistrict(districtName);
    if (districtName) {
      fetch(`http://localhost:3000/api/epw/design-conditions/${encodeURIComponent(districtName)}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setDesignConditions(data.designConditions);
        })
        .catch(error => {
          console.error('Error fetching design conditions:', error);
          setDesignConditions(null);
        });
    } else {
      setDesignConditions(null);
    }
  };

  const subtabStyle = (tab) => ({
    padding: '6px 24px 6px 0',
    fontWeight: 600,
    fontSize: 15,
    borderBottom: activeSubTab === tab ? '2px solid #1976d2' : '2px solid transparent',
    color: activeSubTab === tab ? '#1976d2' : '#222',
    cursor: 'pointer',
    marginRight: 8,
    background: 'none',
    minWidth: 120,
  });

  return (
    <div style={{ position: 'relative', background: '#f5f5f5', minHeight: '100vh', padding: 32, display: 'flex' }}>
      <div style={{ flex: 1, marginRight: 20 }}>
        <IndiaMap onDistrictClick={handleDistrictClick} onDistrictHover={handleDistrictHover} />
        <div id="tooltip" style={{
          position: 'absolute',
          display: 'none',
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px',
          zIndex: 10
        }}></div>
      </div>
      {/* Right side panel for Design Conditions */}
      <div style={{ width: 400, background: '#fff', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.2)', padding: 24, minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Design Conditions</h2>
        {hoveredDistrict ? (
          designConditions ? (
            <div>
              <h3 style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>{hoveredDistrict}</h3>
              {/* Heating Table */}
              {designConditions.Heating && (
                <div style={{ marginBottom: 15 }}>
                  <h4 style={{ fontSize: 16, marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 3 }}>Heating</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {Object.keys(designConditions.Heating).map(percentage => (
                          <th key={percentage} style={{ border: '1px solid #ddd', padding: 5, textAlign: 'left', background: '#f2f2f2', fontSize: 13 }}>{percentage}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Object.keys(designConditions.Heating).map(percentage => (
                          <td key={percentage} style={{ border: '1px solid #ddd', padding: 5, fontSize: 12 }}>
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: 3, marginBottom: 3 }}>DBT: {designConditions.Heating[percentage].dryBulb}</div>
                            <div>WB: {designConditions.Heating[percentage].wetBulb}</div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cooling Table */}
              {designConditions.Cooling && (
                <div style={{ marginBottom: 15 }}>
                  <h4 style={{ fontSize: 16, marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 3 }}>Cooling</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {Object.keys(designConditions.Cooling).map(percentage => (
                          <th key={percentage} style={{ border: '1px solid #ddd', padding: 5, textAlign: 'left', background: '#f2f2f2', fontSize: 13 }}>{percentage}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Object.keys(designConditions.Cooling).map(percentage => (
                          <td key={percentage} style={{ border: '1px solid #ddd', padding: 5, fontSize: 12 }}>
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: 3, marginBottom: 3 }}>DBT: {designConditions.Cooling[percentage].dryBulb}</div>
                            <div>WB: {designConditions.Cooling[percentage].wetBulb}</div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Evaporation Table */}
              {designConditions.Evaporation && (
                <div style={{ marginBottom: 15 }}>
                  <h4 style={{ fontSize: 16, marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 3 }}>Evaporation</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {Object.keys(designConditions.Evaporation).map(percentage => (
                          <th key={percentage} style={{ border: '1px solid #ddd', padding: 5, textAlign: 'left', background: '#f2f2f2', fontSize: 13 }}>{percentage}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Object.keys(designConditions.Evaporation).map(percentage => (
                          <td key={percentage} style={{ border: '1px solid #ddd', padding: 5, fontSize: 12 }}>
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: 3, marginBottom: 3 }}>WB: {designConditions.Evaporation[percentage].wetBulb}</div>
                            <div>MCDB: {designConditions.Evaporation[percentage].meanCoincidentDryBulb}</div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>Fetching design conditions for {hoveredDistrict}...</p>
          )
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>Hover over a district on the map to see its design conditions.</p>
        )}
      </div>
      {popup.visible && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '32px',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }} onClick={() => setPopup({ ...popup, visible: false })}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 0,
            width: '95%',
            maxWidth: 1200,
            maxHeight: '90vh',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            position: 'relative',
            cursor: 'auto',
            border: '1px solid #e0e6ef',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            fontSize: 15,
            overflowX: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            {/* Top Tabs */}
            <div style={{
              borderBottom: '1px solid #e0e6ef',
              padding: '0 24px',
              display: 'flex',
              gap: 24,
              userSelect: 'none',
            }}>
              {['Weather File Summary', 'Range Plots'].map((tab, i) => (
                <div
                  key={i}
                  onClick={() => { setActiveTab(i === 0 ? 'summary' : 'range'); }}
                  style={{
                    padding: '16px 8px',
                    cursor: 'pointer',
                    color: activeTab === (i === 0 ? 'summary' : 'range') ? '#000' : '#666',
                    borderBottom: `2px solid ${activeTab === (i === 0 ? 'summary' : 'range') ? '#007AFF' : 'transparent'}`,
                    transition: 'all 0.2s',
                    fontWeight: activeTab === (i === 0 ? 'summary' : 'range') ? 500 : 400,
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>
            {/* Content */}
            <div style={{
              padding: 24,
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
              position: 'relative',
            }}>
              {activeTab === 'summary' ? (
                popup.summary ? (
                  <SummaryTable summary={popup.summary} district={popup.district} />
                ) : (
                  <div style={{color:'red',padding:16}}>No EPW data found for {popup.district}</div>
                )
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
                    <div
                      onClick={() => setActiveSubTab('temperature')}
                      style={subtabStyle('temperature')}
                    >
                      Temperature Range
                    </div>
                    <div
                      onClick={() => setActiveSubTab('radiation')}
                      style={subtabStyle('radiation')}
                    >
                      Radiation Range
                    </div>
                    <div
                      onClick={() => setActiveSubTab('wind')}
                      style={subtabStyle('wind')}
                    >
                      Wind Velocity Range
                    </div>
                    <div
                      onClick={() => setActiveSubTab('ground')}
                      style={subtabStyle('ground')}
                    >
                      Ground Temperature
                    </div>
                    <div
                      onClick={() => setActiveSubTab('hourlycolormap')}
                      style={subtabStyle('hourlycolormap')}
                    >
                      Hourly Colormap
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 0 6px 0', }}>
                    {activeSubTab === 'temperature' ? (
                      <TemperatureViolinPlot district={popup.district} />
                    ) : activeSubTab === 'radiation' ? (
                      <RadiationViolinPlot district={popup.district} />
                    ) : activeSubTab === 'wind' ? (
                      <WindVelocityViolinPlot district={popup.district} />
                    ) : activeSubTab === 'ground' ? (
                      <GroundTemperatureLinePlot district={popup.district} />
                    ) : (
                      <HourlyColormapPlot district={popup.district} />
                    )}
                  </div>
                </>
              )}
            </div>
            {/* Close Button at Bottom */}
            <button 
              onClick={() => setPopup({ ...popup, visible: false })}
              style={{
                position: 'absolute',
                right: 16,
                top: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Example: always show Ajmer plot for demo */}
      {/* <TemperatureViolinPlot district="Ajmer" /> */}
    </div>
  );
}

export default App;
