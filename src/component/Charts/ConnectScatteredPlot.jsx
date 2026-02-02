import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ConnectScatteredplot = ({ width = 600, height = 400 }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  const data = [
    { x: 1, y: 3 },
    { x: 2, y: 7 },
    { x: 3, y: 4 },
    { x: 4, y: 9 },
    { x: 5, y: 6 },
  ];

  useEffect(() => {
    const margin = { top: 40, right: 40, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear existing content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([innerHeight, 0]);

    // Grid lines
    const xGrid = d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat('');
    const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat('');

    g.append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xGrid);

    g.append('g')
      .attr('class', 'y-grid')
      .call(yGrid);

    // Axes
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));

    g.append('g').call(d3.axisLeft(yScale));

    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    // Draw the animated line
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#007BFF')
      .attr('stroke-width', 2)
      .attr('d', line);

    const totalLength = path.node().getTotalLength();

    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Tooltip setup
    const tooltip = d3.select(tooltipRef.current)
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('padding', '6px 12px')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('color', '#333')
      .style('box-shadow', '0 2px 6px rgba(0,0,0,0.2)')
      .style('pointer-events', 'none');

    // Circles with tooltip
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 5)
      .attr('fill', '#FF5733')
      .on('mouseover', (event, d) => {
        tooltip.style('visibility', 'visible')
          .text(`x: ${d.x}, y: ${d.y}`);
      })
      .on('mousemove', (event) => {
        const svgRect = svgRef.current.getBoundingClientRect();
        tooltip
          .style('top', `${event.clientY - svgRect.top - 10}px`)
          .style('left', `${event.clientX - svgRect.left + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

  }, [data, width, height]);

  return (
    <div className="relative p-8 bg-white border shadow-2xl flex flex-col justify-center items-center rounded-2xl min-h-screen">
      <h2 className="text-2xl text-center text-black font-semibold mb-4">Connected Scatterplot</h2>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
};

export default ConnectScatteredplot;
