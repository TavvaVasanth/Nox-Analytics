'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ScatterplotTour = () => {
  const svgRef = useRef();
  const [clustersData, setClustersData] = useState([]);
  const [bounds, setBounds] = useState([]);

  useEffect(() => {
    const width = 800;
    const height = 600;
    const numClusters = 4;
    const pointsPerCluster = 50;

    // Generate dummy clustered data
    const clusters = d3.range(numClusters).map((clusterIndex) => {
      const cx = Math.random() * (width - 200) + 100;
      const cy = Math.random() * (height - 200) + 100;
      return d3.range(pointsPerCluster).map(() => ({
        x: d3.randomNormal(cx, 30)(),
        y: d3.randomNormal(cy, 30)(),
        cluster: clusterIndex,
      }));
    });

    const data = clusters.flat();
    setClustersData(clusters);

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .style('font', '10px sans-serif');

    const g = svg.select('g');
    if (!g.node()) {
      svg.append('g');
    }

    const draw = svg.select('g');
    draw.selectAll('line')
      .data(data)
      .join('line')
      .attr('x1', d => d.x)
      .attr('y1', d => d.y)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y)
      .attr('stroke', d => d3.schemeCategory10[d.cluster])
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 3);

    // Calculate bounds
    const clusterBounds = clusters.map(cluster => {
      const xs = cluster.map(d => d.x);
      const ys = cluster.map(d => d.y);
      return [d3.min(xs), d3.min(ys), d3.max(xs), d3.max(ys)];
    });

    setBounds(clusterBounds);
  }, []);

  const zoomTo = ([x0, y0, x1, y1]) => {
    const width = 800;
    const height = 600;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const scale = 0.8 / Math.max(dx / width, dy / height);
    const tx = (width - scale * (x0 + x1)) / 2;
    const ty = (height - scale * (y0 + y1)) / 2;

    d3.select(svgRef.current)
      .select('g')
      .transition()
      .duration(1000)
      .attr('transform', `translate(${tx},${ty}) scale(${scale})`);
  };

  const resetZoom = () => {
    d3.select(svgRef.current)
      .select('g')
      .transition()
      .duration(1000)
      .attr('transform', null);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 mt-6">
      <svg
        ref={svgRef}
        width={800}
        height={600}
        className="border rounded shadow-lg bg-white"
      >
        <g></g>
      </svg>

      <div className="flex gap-4 flex-wrap justify-center">
        {bounds.map((bound, i) => (
          <button
            key={i}
            onClick={() => zoomTo(bound)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Zoom to Cluster {i + 1}
          </button>
        ))}
        <button
          onClick={resetZoom}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
};

export default ScatterplotTour;
