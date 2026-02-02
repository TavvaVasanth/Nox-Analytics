import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const generateSampleData = () => {
  const years = d3.range(2000, 2020);
  const brands = Array.from({ length: 100 }, (_, i) => `Brand ${i + 1}`);
  const sectors = ["Tech", "Finance", "Auto", "Retail", "Beverages", "Media"];

  const data = [];
  for (const year of years) {
    for (const brand of brands) {
      data.push({
        year,
        name: brand,
        value: Math.floor(Math.random() * 1000),
        sector: sectors[Math.floor(Math.random() * sectors.length)],
      });
    }
  }
  return data;
};

const BarChartRace = () => {
  const data = generateSampleData();
  const svgRef = useRef();
  const [year, setYear] = useState(2000);
  const width = 900;
  const height = 600;
  const margin = { top: 40, right: 180, bottom: 40, left: 180 };
  const barHeight = 30;
  const topN = 15;

  // Color by sector
  const color = d3.scaleOrdinal(d3.schemeSet2);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg
      .attr("width", width)
      .attr("height", height)
      .style("font-family", "sans-serif");

    const chartG = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const updateChart = (year) => {
      const yearData = data
        .filter((d) => d.year === year)
        .sort((a, b) => b.value - a.value)
        .slice(0, topN);

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(yearData, (d) => d.value)])
        .range([0, width - margin.left - margin.right]);

      const y = d3
        .scaleBand()
        .domain(yearData.map((d) => d.name))
        .range([0, topN * barHeight])
        .padding(0.1);

      // DATA JOIN
      const bars = chartG.selectAll("g.bar").data(yearData, (d) => d.name);

      // ENTER
      const barsEnter = bars
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", (d) => `translate(0,${y(d.name)})`);

      // Rect
      barsEnter
        .append("rect")
        .attr("fill", (d) => color(d.sector))
        .attr("height", y.bandwidth())
        .attr("width", 0);

      // Label: Brand Name
      barsEnter
        .append("text")
        .attr("class", "label")
        .attr("x", -10)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .text((d) => d.name);

      // Label: Value
      barsEnter
        .append("text")
        .attr("class", "value")
        .attr("x", (d) => x(d.value) + 5)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text((d) => d.value);

      // UPDATE
      const barsMerge = barsEnter.merge(bars);

      barsMerge
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("transform", (d) => `translate(0,${y(d.name)})`);

      barsMerge
        .select("rect")
        .transition()
        .duration(1000)
        .attr("width", (d) => x(d.value));

      barsMerge
        .select(".label")
        .transition()
        .duration(1000)
        .attr("y", y.bandwidth() / 2);

      barsMerge
        .select(".value")
        .transition()
        .duration(1000)
        .attr("x", (d) => x(d.value) + 5)
        .attr("y", y.bandwidth() / 2)
        .tween("text", function (d) {
          const i = d3.interpolateNumber(+this.textContent, d.value);
          return function (t) {
            this.textContent = Math.round(i(t));
          };
        });

      // EXIT
      bars.exit()
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();

      // YEAR LABEL
      svg.selectAll(".year-label").remove();
      svg
        .append("text")
        .attr("class", "year-label")
        .attr("x", width - 50)
        .attr("y", height - 30)
        .attr("font-size", "40px")
        .attr("text-anchor", "end")
        .attr("fill", "#999")
        .text(year);
    };

    updateChart(year);

    let currentYear = year;
    const interval = setInterval(() => {
      const yearsAvailable = [...new Set(data.map((d) => d.year))];
      const currentIndex = yearsAvailable.indexOf(currentYear);
      if (currentIndex + 1 >= yearsAvailable.length) {
        clearInterval(interval);
        return;
      }
      currentYear = yearsAvailable[currentIndex + 1];
      setYear(currentYear);
      updateChart(currentYear);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return <svg ref={svgRef}></svg>;
};

export default BarChartRace;
