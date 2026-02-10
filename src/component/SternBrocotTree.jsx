import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function SternBrocotTree() {
  const ref = useRef();

  // Collapse function
  function collapse(f) {
    let n = 1, d = 0, i = f.length;
    while (--i >= 0) [n, d] = [f[i] * n + d, n];
    return [n, d];
  }

  // Data generation logic
  function generateData() {
    const root = { value: [0, 1] };
    const queue = [root];
    let p, size = 0, n = 1 << 6;
    while (++size < n && (p = queue.shift())) {
      const k = p.value.length - 1;
      const a = { value: p.value.slice(0, k).concat(p.value[k] + 1) };
      const b = { value: p.value.slice(0, k).concat(p.value[k] - 1, 2) };
      p.children = k & 1 ? [a, b] : [b, a];
      queue.push(a, b);
    }
    return root;
  }

  useEffect(() => {
    const width = 954;
    const height = 600;
    const margin = 20;

    const data = generateData();
    const root = d3.tree()
      .size([width, height - margin * 2])
      .separation(() => 1)(d3.hierarchy(data));

    const svg = d3.select(ref.current)
      .attr("viewBox", `0 ${-margin} ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif");

    // Links
    svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .selectAll("path")
      .data(root.links())
      .enter().append("path")
      .attr("d", d3.linkVertical()
        .source(d => [d.source.x, d.source.y + 12])
        .target(d => [d.target.x, d.target.y - 12]));

    // Labels
    const label = svg.append("g")
      .attr("text-anchor", "middle")
      .selectAll("g")
      .data(root.descendants())
      .enter().append("g")
      .attr("transform", d => `translate(${Math.round(d.x)},${Math.round(d.y)})`);

    label.append("line")
      .attr("x1", -5)
      .attr("x2", 5)
      .attr("stroke", "black");

    label.append("text")
      .datum(d => collapse(d.data.value))
      .call(t => t.append("tspan").attr("y", -2.5).text(d => d[0]))
      .call(t => t.append("tspan").attr("x", 0).attr("y", 9.5).text(d => d[1]));

  }, []);

  return <svg ref={ref}></svg>;
}
