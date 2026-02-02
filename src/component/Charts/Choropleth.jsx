import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function Choropleth() {
  const ref = useRef();
  const [data, setData] = useState([]);
  const [us, setUS] = useState(null);

  // Load data
  useEffect(() => {
    d3.csv("/unemployment-x.csv", d => ({
      id: String(d.id).padStart(5, "0"),
      state: d.state,
      county: d.county,
      rate: +d.rate
    })).then(setData);

    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
      .then(res => res.json())
      .then(setUS);
  }, []);

  // Draw map
  useEffect(() => {
    if (!us || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 975;
    const height = 610;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    const counties = topojson.feature(us, us.objects.counties);
    const states = topojson.feature(us, us.objects.states);
    const stateMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

    const valuemap = new Map(data.map(d => [d.id, d]));

    const projection = d3
      .geoAlbersUsa()
      .fitSize([width, height], states);

    const path = d3.geoPath(projection);

    const color = d3
      .scaleQuantize()
      .domain([1, 10])
      .range(d3.schemeBlues[9]);

    // Legend
    svg.append("g")
      .attr("transform", "translate(620,20)")
      .append(() =>
        Legend({
          color,
          title: "Unemployment rate (%)",
          width: 260
        })
      );

    // Counties
    svg.append("g")
      .selectAll("path")
      .data(counties.features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const v = valuemap.get(d.id);
        return v ? color(v.rate) : "#eee";
      })
      .attr("stroke", "#999")
      .attr("stroke-width", 0.15)
      .append("title")
      .text(d => {
        const v = valuemap.get(d.id);
        return `${d.properties.name}
${v ? v.rate + "%" : "No data"}`;
      });

    // State borders
    svg.append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .attr("d", path);

  }, [data, us]);

  return <svg ref={ref}></svg>;
}

// ---------------- LEGEND ----------------

function Legend({ color, title, width = 260 }) {
  const scale = d3.scaleLinear()
    .domain(color.domain())
    .range([0, width]);

  const axis = d3.axisBottom(scale)
    .ticks(width / 80)
    .tickSize(-13);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", 44)
    .attr("viewBox", [0, 0, width, 44])
    .style("font", "10px sans-serif");

  svg.append("g")
    .selectAll("rect")
    .data(color.range().map(c => color.invertExtent(c)))
    .join("rect")
    .attr("x", d => scale(d[0]))
    .attr("width", d => scale(d[1]) - scale(d[0]))
    .attr("height", 13)
    .attr("fill", d => color(d[0]));

  svg.append("g")
    .attr("transform", "translate(0,13)")
    .call(axis)
    .call(g => g.select(".domain").remove())
    .call(g =>
      g.append("text")
        .attr("x", width / 2)
        .attr("y", -6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text(title)
    );

  return svg.node();
}
