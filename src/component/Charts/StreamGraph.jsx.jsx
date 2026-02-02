import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const StreamGraph = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 928;
    const height = 500;
    const n = 20; // number of layers
    const m = 200; // number of samples per layer
    const k = 10;  // number of bumps
    const z = d3.interpolateCool;

    const x = d3.scaleLinear().domain([0, m - 1]).range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const area = d3.area()
      .x((d, i) => x(i))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    const stack = d3.stack()
      .keys(d3.range(n))
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderNone);

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    const randomize = () => {
      const layers = stack(d3.transpose(Array.from({ length: n }, () => bumps(m, k))));
      y.domain([
        d3.min(layers, l => d3.min(l, d => d[0])),
        d3.max(layers, l => d3.max(l, d => d[1]))
      ]);
      return layers;
    };

    // Initial render
    let layers = randomize();

    const path = svg.selectAll("path")
      .data(layers)
      .join("path")
      .attr("d", area)
      .attr("fill", () => z(Math.random()));

    // Animate continuously
    const interval = setInterval(() => {
      layers = randomize();
      path.data(layers)
        .transition()
        .duration(1500)
        .attr("d", area);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Bump function used to generate wave-like random data
  function bumps(n, m) {
    const a = [];
    for (let i = 0; i < n; ++i) a[i] = 0;
    for (let j = 0; j < m; ++j) {
      const x = 1 / (0.1 + Math.random());
      const y = 2 * Math.random() - 0.5;
      const z = 10 / (0.1 + Math.random());
      for (let i = 0; i < n; ++i) {
        const w = (i / n - y) * z;
        a[i] += x * Math.exp(-w * w);
      }
    }
    return a;
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Animated Streamgraph with D3.js</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default StreamGraph;
