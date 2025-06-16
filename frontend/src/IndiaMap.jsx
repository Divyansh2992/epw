import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

export default function IndiaMap({ onDistrictClick, onDistrictHover }) {
  const svgRef = useRef();

  useEffect(() => {
    d3.json('/india.json').then((topology) => {
      const india = feature(topology, topology.objects.districts);
      const width = 800;
      const height = 700;
      const projection = d3.geoMercator().fitSize([width, height], india);
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
          const [x, y] = d3.pointer(event, svg.node());
          d3.select('#tooltip')
            .style('left', `${x + 20}px`)
            .style('top', `${y + 20}px`)
            .style('display', 'block')
            .text(d.properties.district);
          if (onDistrictHover) onDistrictHover(d.properties.district);
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
          if (onDistrictHover) onDistrictHover(null);
        })
        .on('click', function (event, d) {
          if (onDistrictClick) onDistrictClick(d.properties.district);
        });
    });
  }, [onDistrictClick, onDistrictHover]);

  return <svg ref={svgRef}></svg>;
}
