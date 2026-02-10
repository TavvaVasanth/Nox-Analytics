import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

export default function RadialAreaChartApp() {
  const [data, setData] = useState([]);
  const ref = useRef();

  // Preprocess CSV rows into grouped structure
  function preprocessTemperatureData(rows) {
    return d3.groups(
      rows,
      d => new Date(Date.UTC(2000, d.DATE.getUTCMonth(), d.DATE.getUTCDate()))
    )
    .sort(([a], [b]) => d3.ascending(a, b))
    .map(([date, v]) => ({
      date,
      avg: d3.mean(v, d => (d.TAVG !== null ? d.TAVG : NaN)),
      min: d3.mean(v, d => (d.TMIN !== null ? d.TMIN : NaN)),
      max: d3.mean(v, d => (d.TMAX !== null ? d.TMAX : NaN)),
      minmin: d3.min(v, d => (d.TMIN !== null ? d.TMIN : NaN)),
      maxmax: d3.max(v, d => (d.TMAX !== null ? d.TMAX : NaN))
    }));
  }

  // Load CSV once
  useEffect(() => {
    d3.csv("/sfo-temperature.csv", d3.autoType).then(rows => {
      setData(preprocessTemperatureData(rows));
    });
  }, []);

  // Draw chart
  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 928;
    const height = width;
    const margin = 10;
    const innerRadius = width / 5;
    const outerRadius = width / 2 - margin;

    const x = d3.scaleUtc()
      .domain([new Date("2000-01-01"), new Date("2001-01-01") - 1])
      .range([0, 2 * Math.PI]);

    const y = d3.scaleRadial()
      .domain([d3.min(data, d => d.minmin), d3.max(data, d => d.maxmax)])
      .range([innerRadius, outerRadius]);

    const line = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .angle(d => x(d.date));

    const area = d3.areaRadial()
      .curve(d3.curveLinearClosed)
      .angle(d => x(d.date));

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "width: 100%; height: auto; font: 10px sans-serif;")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    svg.selectAll("*").remove(); // clear previous render

    // Outer band (minmin to maxmax)
    svg.append("path")
      .attr("fill", "lightsteelblue")
      .attr("fill-opacity", 0.2)
      .attr("d", area
        .innerRadius(d => y(d.minmin))
        .outerRadius(d => y(d.maxmax))(data));

    // Inner band (min to max)
    svg.append("path")
      .attr("fill", "steelblue")
      .attr("fill-opacity", 0.2)
      .attr("d", area
        .innerRadius(d => y(d.min))
        .outerRadius(d => y(d.max))(data));

    // Average line
    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line.radius(d => y(d.avg))(data));

    // Month ticks
    svg.append("g")
      .selectAll()
      .data(x.ticks())
      .join("g")
        .each((d, i) => d.id = `month-${i}`)
        .call(g => g.append("path")
          .attr("stroke", "#000")
          .attr("stroke-opacity", 0.2)
          .attr("d", d => `
            M${d3.pointRadial(x(d), innerRadius)}
            L${d3.pointRadial(x(d), outerRadius)}
          `))
        .call(g => g.append("path")
          .attr("id", d => d.id)
          .datum(d => [d, d3.utcMonth.offset(d, 1)])
          .attr("fill", "none")
          .attr("d", ([a, b]) => `
            M${d3.pointRadial(x(a), innerRadius)}
            A${innerRadius},${innerRadius} 0,0,1 ${d3.pointRadial(x(b), innerRadius)}
          `))
        .call(g => g.append("text")
          .append("textPath")
          .attr("startOffset", 6)
          .attr("xlink:href", d => `#${d.id}`)
          .text(d3.utcFormat("%B")));

    // Radial ticks
    svg.append("g")
      .attr("text-anchor", "middle")
      .selectAll()
      .data(y.ticks().reverse())
      .join("g")
        .call(g => g.append("circle")
          .attr("fill", "none")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.2)
          .attr("r", y))
        .call(g => g.append("text")
          .attr("y", d => -y(d))
          .attr("dy", "0.35em")
          .attr("stroke", "#fff")
          .attr("stroke-width", 5)
          .attr("fill", "currentColor")
          .attr("paint-order", "stroke")
          .text((val, i) => `${val.toFixed(0)}${i ? "" : "°F"}`)
          .clone(true)
          .attr("y", d => y(d)));

  }, [data]);

  return (
    <div>
      <h1>SFO Radial Temperature Chart</h1>
      <svg ref={ref}></svg>
    </div>
  );
}
