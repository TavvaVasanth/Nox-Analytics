// TemporalGraph.js
'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
const data = {
    nodes: [
      { id: "node0", start: "2023-01-01T09:10:00", end: "2023-01-01T17:10:00" },
      { id: "node1", start: "2023-01-01T09:20:00", end: "2023-01-01T17:20:00" },
      { id: "node2", start: "2023-01-01T09:30:00", end: "2023-01-01T17:30:00" },
      { id: "node3", start: "2023-01-01T09:40:00", end: "2023-01-01T17:40:00" },
      { id: "node4", start: "2023-01-01T09:50:00", end: "2023-01-01T17:50:00" },
      { id: "node5", start: "2023-01-01T10:00:00", end: "2023-01-01T18:00:00" },
      { id: "node6", start: "2023-01-01T10:10:00", end: "2023-01-01T18:10:00" },
      { id: "node7", start: "2023-01-01T10:20:00", end: "2023-01-01T18:20:00" },
      { id: "node8", start: "2023-01-01T10:30:00", end: "2023-01-01T18:30:00" },
      { id: "node9", start: "2023-01-01T10:40:00", end: "2023-01-01T18:40:00" }
    ],
    links: [
      { source: "node0", target: "node1", start: "2023-01-01T09:30:00", end: "2023-01-01T11:30:00" },
      { source: "node1", target: "node2", start: "2023-01-01T09:45:00", end: "2023-01-01T12:00:00" },
      { source: "node2", target: "node3", start: "2023-01-01T10:00:00", end: "2023-01-01T12:30:00" },
      { source: "node3", target: "node4", start: "2023-01-01T10:15:00", end: "2023-01-01T13:00:00" },
      { source: "node4", target: "node5", start: "2023-01-01T10:30:00", end: "2023-01-01T13:30:00" },
      { source: "node5", target: "node6", start: "2023-01-01T10:45:00", end: "2023-01-01T14:00:00" },
      { source: "node6", target: "node7", start: "2023-01-01T11:00:00", end: "2023-01-01T14:30:00" },
      { source: "node7", target: "node8", start: "2023-01-01T11:15:00", end: "2023-01-01T15:00:00" },
      { source: "node8", target: "node9", start: "2023-01-01T11:30:00", end: "2023-01-01T15:30:00" },
      { source: "node9", target: "node0", start: "2023-01-01T11:45:00", end: "2023-01-01T16:00:00" }
    ]
  };
   // Place the JSON in public or import from relative path

const TemporalGraph = () => {
  const svgRef = useRef();
  const [time, setTime] = useState(new Date(data.nodes[0].start));
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .style('background', '#f9f9f9')
      .style('border', '1px solid #ccc');

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const g = svg.append('g');
    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const ticked = () => {
      linkGroup.selectAll('line')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeGroup.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    };

    const updateGraph = (currentTime) => {
      const activeNodes = data.nodes.filter(n => new Date(n.start) <= currentTime && new Date(n.end) >= currentTime);
      const nodeIds = new Set(activeNodes.map(n => n.id));
      const activeLinks = data.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target) && new Date(l.start) <= currentTime && new Date(l.end) >= currentTime);

      // Bind data
      const link = linkGroup.selectAll('line').data(activeLinks, d => d.source + '-' + d.target);
      link.exit().transition().duration(500).style('opacity', 0).remove();
      link.enter().append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 1.5);

      const node = nodeGroup.selectAll('circle').data(activeNodes, d => d.id);
      node.exit().transition().duration(500).style('opacity', 0).remove();
      node.enter().append('circle')
        .attr('r', 6)
        .attr('fill', '#1f77b4')
        .call(drag(simulation));

      simulation.nodes(activeNodes).on('tick', ticked);
      simulation.force('link').links(activeLinks);
      simulation.alpha(0.5).restart();
    };

    const drag = simulation => d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    updateGraph(time);

    return () => svg.selectAll('*').remove();
  }, [time]);

  const play = () => {
    if (isPlaying) {
      clearInterval(intervalId);
      setIsPlaying(false);
      return;
    }

    const id = setInterval(() => {
      setTime(prev => new Date(prev.getTime() + 5 * 60000)); // advance 5 minutes
    }, 1000);
    setIntervalId(id);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      <svg ref={svgRef} width={800} height={600}></svg>
      <div className="flex items-center gap-4">
        <button onClick={play} className="px-4 py-2 bg-blue-500 text-white rounded">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span>Current Time: {time.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default TemporalGraph;
