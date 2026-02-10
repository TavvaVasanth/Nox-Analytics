// DirectlyLabellingLines.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const DirectlyLabellingLines = ({ width = 800 }) => {
  const ref = useRef();

  useEffect(() => {
    const margin = { left: 20, bottom: 20, right: 60, top: 10 };
    const height = width * 0.5;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain([new Date(2010, 0, 1), new Date(2010, 3, 1)])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 20])
      .range([chartHeight, 0]);

    // Axes
    const xAxisGenerator = d3.axisBottom(xScale)
      .tickValues(d3.range(0, 4).map(d => new Date(2010, d, 1)));

    const yAxisGenerator = d3.axisLeft(yScale)
      .tickValues(d3.range(0, 30, 5));

    g.append("g")
      .call(xAxisGenerator)
      .attr("transform", `translate(0, ${chartHeight})`);

    g.append("g").call(yAxisGenerator);

    // Line generator
    const lineGenerator = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    // Colors
    const colors = {
      Apples: { light: "#fb9a99", dark: "#e31a1c" },
      Blueberries: { light: "#a6cee3", dark: "#1f78b4" },
      Carrots: { light: "#fdbf6f", dark: "#ff7f00" }
    };

    // Parse CSV
    d3.csv("https://gist.githubusercontent.com/HarryStevens/2ca674b53b0ea1ab806a3e704386c4c9/raw/3828df9890fbe0ff8b5259e2e3f9ebd1d38984bc/fruits.csv")
      .then(rawData => {
        const data = parseData(rawData);
        const lineData = parseLineData(data);

        // Draw lines
        g.selectAll(".line")
          .data(lineData)
          .enter().append("path")
          .attr("d", d => lineGenerator(d.data))
          .style("fill", "none")
          .style("stroke", d => d.light)
          .style("stroke-width", 2)
          .style("stroke-linejoin", "round");

        // Direct labels
        const valueLabel = g.selectAll(".label")
          .data(lineData)
          .enter().append("g")
          .attr("transform", d => {
            const lastPoint = d.data[d.data.length - 1];
            return `translate(${xScale(lastPoint.date)}, ${yScale(lastPoint.value)})`;
          });

        valueLabel.append("circle")
          .attr("r", 4)
          .style("stroke", "white")
          .style("fill", d => d.light);

        valueLabel.append("text")
          .text(d => d.data[d.data.length - 1].value)
          .attr("dy", 5)
          .attr("dx", 10)
          .style("font-family", "monospace")
          .style("fill", d => d.dark);
      });

    // Helper functions
    function parseData(data) {
      return data.map(d => {
        const [mm, dd, yy] = d.Date.split("/");
        const date = new Date(+("20" + yy), mm - 1, +dd);
        const obj = { date };
        for (let col in d) {
          if (col !== "Date") obj[col] = +d[col];
        }
        return obj;
      });
    }

    function parseLineData(data) {
      return Object.keys(colors).map(key => ({
        name: key,
        data: data.map(d => ({ date: d.date, value: d[key] })),
        light: colors[key].light,
        dark: colors[key].dark
      }));
    }
  }, [width]);

  return <svg ref={ref}></svg>;
};

export default DirectlyLabellingLines;
