import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

function App() {
  const svgRef = useRef();

  useEffect(() => {
    // Load the TopoJSON data
    d3.json('/india.json').then((topology) => {
      // Use the correct object key from india.json
      const india = feature(topology, topology.objects.districts);
      const width = 800;
      const height = 900;

      const projection = d3.geoMercator()
        .fitSize([width, height], india);
      const path = d3.geoPath().projection(projection);

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      svg.selectAll('path')
        .data(india.features)
        .join('path')
        .attr('d', path)
        .attr('fill', '#b3d1ff')
        .attr('stroke', '#333')
        .on('mouseover', function (event, d) {
          d3.select(this).attr('fill', '#ffcc00');
          // Show tooltip
          const [x, y] = d3.pointer(event, svg.node());
          d3.select('#tooltip')
            .style('left', `${x + 20}px`)
            .style('top', `${y + 20}px`)
            .style('display', 'block')
            .text(d.properties.district);
        })
        .on('mousemove', function (event) {
          const [x, y] = d3.pointer(event, svg.node());
          d3.select('#tooltip')
            .style('left', `${x + 20}px`)
            .style('top', `${y + 20}px`);
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', '#b3d1ff');
          d3.select('#tooltip').style('display', 'none');
        });
    });
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
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
  );
}

export default App;
