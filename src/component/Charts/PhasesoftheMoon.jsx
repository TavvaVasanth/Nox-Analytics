import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

// Approximate moon phase calculation (0 = new, 0.5 = full)
function getMoonPhase(date) {
  const lp = 2551443; // lunar period in seconds (~29.53 days)
  const newMoon = new Date(Date.UTC(2000, 0, 6, 18, 14)); // reference new moon
  const phase = ((date.getTime() - newMoon.getTime()) / 1000) % lp;
  return phase / lp; // value between 0 and 1
}

const PhasesoftheMoon = ({ locale = "en-US" }) => {
  const [year, setYear] = useState(2026); // default year 2026
  const svgRef = useRef();

  useEffect(() => {
    const width = 975;
    const height = 600;
    const margin = { top: 40, right: 20, bottom: 20, left: 80 };

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("background", "#111")
      .style("font", "10px sans-serif");

    const start = new Date(year, 0, 1);
    const days = d3.timeDays(start, d3.timeYear.offset(start, 1));
    const months = d3.timeMonths(start, d3.timeYear.offset(start, 1));

    const dayScale = d3.scalePoint()
      .domain(d3.range(1, 32))
      .range([margin.left, width - margin.right])
      .padding(1);

    const monthScale = d3.scalePoint()
      .domain(d3.range(12))
      .range([margin.top, height - margin.bottom])
      .padding(1);

    svg.selectAll("*").remove();

    // Month labels
    svg.selectAll("text.month")
      .data(months)
      .join("text")
      .attr("class", "month")
      .attr("x", 20)
      .attr("y", d => monthScale(d.getMonth()))
      .attr("dy", "0.32em")
      .attr("fill", "#fff")
      .text(d => d.toLocaleString(locale, { month: "long" }));

    // Day numbers
    svg.selectAll("text.day")
      .data(d3.range(1, 32))
      .join("text")
      .attr("class", "day")
      .attr("x", d => dayScale(d))
      .attr("y", margin.top - 15)
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .style("font", "8px sans-serif")
      .text(d => d);

    // Projection + hemisphere
    const projection = d3.geoOrthographic().translate([0, 0]).scale(10);
    const path = d3.geoPath(projection);
    const hemisphere = d3.geoCircle()();

    const moonGroup = svg.selectAll("g.moon")
      .data(days)
      .join("g")
      .attr("class", "moon")
      .attr("transform", d => `translate(${dayScale(d.getDate())},${monthScale(d.getMonth())})`);

    const r = 10;

    // Base disk
    moonGroup.append("circle")
      .attr("r", r)
      .attr("fill", "#333");

    // Day number above moon
    moonGroup.append("text")
      .attr("fill", "#fff")
      .attr("y", -r)
      .attr("dy", "-0.4em")
      .attr("text-anchor", "middle")
      .style("font", "6px sans-serif")
      .text(d => d.getDate());

    // Illuminated portion
    moonGroup.append("path")
      .attr("fill", "#fff")
      .attr("d", d => {
        const noon = d3.timeHour.offset(d, 12);
        const phase = getMoonPhase(noon);
        const angle = 180 - phase * 360;
        projection.rotate([angle, 0]);
        return path(hemisphere);
      })
      .append("title")
      .text(d => d.toLocaleDateString(locale));
  }, [year, locale]);

  return (
    <div>
      <input
        type="number"
        value={year}
        min={1900}
        max={2100}
        step={1}
        style={{ width: "120px", marginBottom: "10px" }}
        onChange={e => setYear(+e.target.value)}
      />
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PhasesoftheMoon;
