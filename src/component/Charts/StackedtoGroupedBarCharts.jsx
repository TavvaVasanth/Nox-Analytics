import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const sampleData = [
  { state: "CA", age: "<10", population: 5038433 },
  { state: "TX", age: "<10", population: 3983091 },
  { state: "FL", age: "<10", population: 2211012 },
  { state: "NY", age: "<10", population: 2319945 },
  { state: "IL", age: "<10", population: 1619682 },
  { state: "PA", age: "<10", population: 1458931 },
  { state: "CA", age: "10-19", population: 5170341 },
  { state: "TX", age: "10-19", population: 3910528 },
  { state: "FL", age: "10-19", population: 2331102 },
  { state: "NY", age: "10-19", population: 2445591 },
  { state: "IL", age: "10-19", population: 1715984 },
  { state: "PA", age: "10-19", population: 1608018 },
  { state: "CA", age: "20-29", population: 5809455 },
  { state: "TX", age: "20-29", population: 3946447 },
  { state: "FL", age: "20-29", population: 2597830 },
  { state: "NY", age: "20-29", population: 2894266 },
  { state: "IL", age: "20-29", population: 1789739 },
  { state: "PA", age: "20-29", population: 1712448 },
  { state: "CA", age: "30-39", population: 5354112 },
  { state: "TX", age: "30-39", population: 3770534 },
  { state: "FL", age: "30-39", population: 2416176 },
  { state: "NY", age: "30-39", population: 2605355 },
  { state: "IL", age: "30-39", population: 1721954 },
  { state: "PA", age: "30-39", population: 1520409 },
  { state: "CA", age: "40-49", population: 5179258 },
  { state: "TX", age: "40-49", population: 3545746 },
  { state: "FL", age: "40-49", population: 2575576 },
  { state: "NY", age: "40-49", population: 2617327 },
  { state: "IL", age: "40-49", population: 1697069 },
  { state: "PA", age: "40-49", population: 1645291 },
  { state: "CA", age: "50-59", population: 5042094 },
  { state: "TX", age: "50-59", population: 3344930 },
  { state: "FL", age: "50-59", population: 2762983 },
  { state: "NY", age: "50-59", population: 2755620 },
  { state: "IL", age: "50-59", population: 1773366 },
  { state: "PA", age: "50-59", population: 1881378 },
  { state: "CA", age: "60-69", population: 3737461 },
  { state: "TX", age: "60-69", population: 2431494 },
  { state: "FL", age: "60-69", population: 2404659 },
  { state: "NY", age: "60-69", population: 2095207 },
  { state: "IL", age: "60-69", population: 1326121 },
  { state: "PA", age: "60-69", population: 1491536 },
  { state: "CA", age: "70-79", population: 2011678 },
  { state: "TX", age: "70-79", population: 1291486 },
  { state: "FL", age: "70-79", population: 1615547 },
  { state: "NY", age: "70-79", population: 1160055 },
  { state: "IL", age: "70-79", population: 728821 },
  { state: "PA", age: "70-79", population: 850897 },
  { state: "CA", age: "≥80", population: 1311374 },
  { state: "TX", age: "≥80", population: 732179 },
  { state: "FL", age: "≥80", population: 1019566 },
  { state: "NY", age: "≥80", population: 804091 },
  { state: "IL", age: "≥80", population: 478948 },
  { state: "PA", age: "≥80", population: 615069 }
];

const StackedtoGroupedBarCharts = () => {
  const chartRef = useRef();
  const [view, setView] = useState("stacked");

  useEffect(() => {
    const data = sampleData;
    const width = 1000;
    const height = 600;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 60;
    const marginLeft = 60;

    d3.select(chartRef.current).selectAll("*").remove();

    const states = Array.from(new Set(data.map(d => d.state)));
    const ages = Array.from(new Set(data.map(d => d.age)));

    const x0 = d3.scaleBand()
      .domain(states)
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    const x1 = d3.scaleBand()
      .domain(ages)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const yMax = d3.max(
      view === "stacked"
        ? d3.rollups(data, v => d3.sum(v, d => d.population), d => d.state).map(d => d[1])
        : data.map(d => d.population)
    );

    const y = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - marginBottom, marginTop]);

    const color = d3.scaleOrdinal()
      .domain(ages)
      .range(d3.schemePastel1); // 🎨 Light colors

    const svg = d3.select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    if (view === "stacked") {
      const nestedData = d3.index(data, d => d.state, d => d.age);

      const series = d3.stack()
        .keys(ages)
        .value(([, group], key) => group.get(key)?.population || 0)
        (nestedData);

      svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(D => D.map(d => (d.key = D.key, d)))
        .join("rect")
        .attr("x", d => x0(d.data[0]))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x0.bandwidth())
        .append("title")
        .text(d => `${d.data[0]} | Age ${d.key}\nPopulation: ${d.data[1].get(d.key)?.population?.toLocaleString("en-IN")}`);
    } else {
      const grouped = d3.group(data, d => d.state);

      svg.append("g")
        .selectAll("g")
        .data(grouped)
        .join("g")
        .attr("transform", ([state]) => `translate(${x0(state)},0)`)
        .selectAll("rect")
        .data(([, group]) => group)
        .join("rect")
        .attr("x", d => x1(d.age))
        .attr("y", d => y(d.population))
        .attr("width", x1.bandwidth())
        .attr("height", d => y(0) - y(d.population))
        .attr("fill", d => color(d.age))
        .append("title")
        .text(d => `${d.state} | Age ${d.age}\nPopulation: ${d.population.toLocaleString("en-IN")}`);
    }

    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.selectAll(".domain").remove());

    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, 20)`)
      .selectAll("g")
      .data(ages)
      .join("g")
      .attr("transform", (_, i) => `translate(0, ${i * 20})`);

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color);

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text(d => d);
  }, [view]);

  return (
    <div className="flex flex-col items-center p-4 bg-white">
      <div className="mb-4 space-x-4">
        <label>
          <input
            type="radio"
            name="view"
            value="stacked"
            checked={view === "stacked"}
            onChange={() => setView("stacked")}
          />
          <span className="ml-1">Stacked</span>
        </label>
        <label>
          <input
            type="radio"
            name="view"
            value="grouped"
            checked={view === "grouped"}
            onChange={() => setView("grouped")}
          />
          <span className="ml-1">Grouped</span>
        </label>
      </div>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default StackedtoGroupedBarCharts;
