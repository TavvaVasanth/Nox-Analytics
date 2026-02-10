import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function PulsarChart() {
  const ref = useRef();

  useEffect(() => {
    const width = 1152;
    const height = 760;
    const marginTop = 60;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 10;
    const overlap = 16;

    d3.csv("/pulsar.csv").then(raw => {
      const pulsar = raw.flatMap((row, z) =>
        Object.values(row).map((y, x) => [x * 92 / 299, +y, z])
      );

      const x = d3.scaleLinear()
        .domain(d3.extent(pulsar, d => d[0]))
        .range([marginLeft, width - marginRight]);

      const z = d3.scalePoint()
        .domain(pulsar.map(d => d[2]))
        .range([marginTop, height - marginBottom]);

      const y = d3.scaleLinear()
        .domain(d3.extent(pulsar, d => d[1]))
        .range([0, -overlap * z.step()]);

      const line = d3.line()
        .defined(d => !isNaN(d[1]))
        .x(d => x(d[0]))
        .y(d => y(d[1]));

      const svg = d3.select(ref.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      svg.append("g")
        .attr("fill", "white")
        .attr("stroke", "black")
        .selectAll("path")
        .data(d3.group(pulsar, d => d[2]))
        .join("path")
        .attr("transform", d => `translate(0,${z(d[0])})`)
        .attr("d", d => line(d[1]));

      svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:first-of-type text")
          .append("tspan")
          .attr("x", 10)
          .text(" ms"));
    });
  }, []);

  return <svg ref={ref}></svg>;
}
