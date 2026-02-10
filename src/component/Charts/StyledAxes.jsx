// StyledAxes.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const StyledAxes = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 928;
    const height = 500;
    const marginTop = 20;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 0;

    const x = d3.scaleUtc()
      .domain([new Date("2010-08-01"), new Date("2012-08-01")])
      .range([marginLeft, width - marginRight]);

    const y = d3.scaleLinear()
      .domain([0, 2e6])
      .range([height - marginBottom, marginTop]);

    function formatTick(d) {
      const s = (d / 1e6).toFixed(1);
      return this.parentNode.nextSibling ? `\xa0${s}` : `$${s} million`;
    }

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Clear previous content
    svg.selectAll("*").remove();

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3.axisBottom(x)
          .ticks(d3.utcMonth.every(3))
          .tickFormat(d => d <= d3.utcYear(d) ? d.getUTCFullYear() : null)
      )
      .call(g => g.select(".domain").remove());

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(
        d3.axisRight(y)
          .tickSize(width - marginLeft - marginRight)
          .tickFormat(formatTick)
      )
      .call(g => g.select(".domain").remove())
      .call(g =>
        g.selectAll(".tick:not(:first-of-type) line")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "2,2")
      )
      .call(g =>
        g.selectAll(".tick text")
          .attr("x", 4)
          .attr("dy", -4)
      );
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default StyledAxes;
