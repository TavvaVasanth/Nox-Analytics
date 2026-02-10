// HertzspringRussell.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Utility functions
function bv2rgb(bv) {
  bv = Math.max(-0.4, Math.min(2, bv));
  let t;
  return `#${[
    bv < 0 ? (t = (bv + 0.4) / 0.4, 0.61 + (0.11 * t) + (0.1 * t * t))
      : bv < 0.4 ? (t = bv / 0.4, 0.83 + (0.17 * t))
      : 1,
    bv < 0 ? (t = (bv + 0.4) / 0.4, 0.70 + (0.07 * t) + (0.1 * t * t))
      : bv < 0.4 ? (t = bv / 0.4, 0.87 + (0.11 * t))
      : bv < 1.6 ? (t = (bv - 0.4) / 1.20, 0.98 - (0.16 * t))
      : (t = (bv - 1.6) / 0.4, 0.82 - (0.5 * t * t)), 
    bv < 0.4 ? 1
      : bv < 1.5 ? (t = (bv - 0.4) / 1.1, 1 - (0.47 * t) + (0.1 * t * t))
      : bv < 1.94 ? (t = (bv - 1.5) / 0.44, 0.63 - (0.6 * t * t))
      : 0
  ].map(t => Math.round(t * 255).toString(16).padStart(2, "0")).join("")}`;
}

function temperature(color) {
  return 4600 * (1 / (0.92 * color + 1.7) + 1 / (0.92 * color + 0.62));
}

function color(temperature) {
  const u = 8464 / temperature;
  return (u - 2.1344 + Math.hypot(0.9936, u)) / 1.6928;
}

export default function HertzspringRussell() {
  const ref = useRef();

  useEffect(() => {
    const width = 928;
    const height = Math.round(width * 1.2);
    const marginTop = 40;
    const marginRight = 40;
    const marginBottom = 40;
    const marginLeft = 40;

    const svg = d3.select(ref.current)
      .attr("width", width + 28)
      .attr("height", height)
      .attr("viewBox", [-14, 0, width + 28, height])
      .style("background", "#000")
      .style("color", "#fff")
      .attr("fill", "currentColor")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    // Fetch CSV data
    d3.csv("/catalog.csv", d => ({
      color: +d.color, // B-V index
      absolute_magnitude: +d.absolute_magnitude
    })).then(data => {
      const x = d3.scaleLinear([-0.39, 2.19], [marginLeft, width - marginRight]);
      const y = d3.scaleLinear([-7, 19], [marginTop, height - marginBottom]);
      const z = bv2rgb;

      svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => x(d.color))
        .attr("y", d => y(d.absolute_magnitude))
        .attr("fill", d => z(d.color))
        .attr("width", 0.75)
        .attr("height", 0.75);

      // Axes
      svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(d3.scaleLog(y.domain().map(m => Math.pow(10, 4.83 - m)), y.range())));

      svg.append("g")
        .attr("transform", `translate(${width - marginRight},0)`)
        .call(d3.axisRight(y).ticks(null, "+"));

      svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(null, "+f"));

      svg.append("g")
        .attr("transform", `translate(0,${marginTop})`)
        .call(((temperatures) => d3.axisTop(x)
          .tickValues(temperatures.map(color))
          .tickFormat((_, i) => temperatures[i].toLocaleString("en")))
          (d3.range(3000, 10001, 1000).concat(20000)));

      svg.selectAll(".domain").remove();
    });
  }, []);

  return <svg ref={ref}></svg>;
}
