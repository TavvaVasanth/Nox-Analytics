import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function NonContiguousCartogram() {
  const ref = useRef();
  const [us, setUs] = useState(null);
  const [data, setData] = useState(null);
  const [year, setYear] = useState(2008);

  // Load topojson + CSV
  useEffect(() => {
    fetch("/states-albers-10m.json")
      .then(res => res.json())
      .then(setUs);

    d3.csv("/obesity-2008-2018.csv", d => ({
      id: d.id,
      obesity2008: +d.obesity2008,
      obesity2018: +d.obesity2018
    })).then(rows => {
      const map = new Map(rows.map(d => [
        d.id,
        { 2008: d.obesity2008, 2018: d.obesity2018 }
      ]));
      setData(map);
    });
  }, []);

  // Auto-switch to 2018 after 2 seconds unless user changes
  useEffect(() => {
    const timer = setTimeout(() => setYear(2018), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Render once data is ready
useEffect(() => {
  if (!us || !data) return;

  const width = 975;
  const height = 610;

  const svg = d3.select(ref.current)
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("max-width", "100%")
    .style("height", "auto");

  // 🔴 CLEAR PREVIOUS DRAW
  svg.selectAll("*").remove();

  const path = d3.geoPath();

  const color = d3.scaleSequential(
    d3.extent(
      Array.from(data.values()).flatMap(d => [d[2008], d[2018]])
    ),
    d3.interpolateReds
  );

  // State borders
  svg.append("path")
    .datum(topojson.mesh(us, us.objects.states))
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("d", path);

  const states = topojson.feature(us, us.objects.states).features;

  const state = svg.append("g")
    .selectAll("path")
    .data(states.filter(d => data.has(d.id)))
    .join("path")
    .attr("d", path)
    .attr("fill", d => color(data.get(d.id)[year]))
    .attr("stroke", "#000")
    .attr("vector-effect", "non-scaling-stroke")
    .attr("transform", d => transform(d, year));

  function transform(d, year) {
    const [x, y] = path.centroid(d);
    return `
      translate(${x},${y})
      scale(${Math.sqrt(data.get(d.id)[year])})
      translate(${-x},${-y})
    `;
  }

}, [us, data, year]);


  return (
    <div>
      <div style={{ marginBottom: "10px", color: "#000" }}>
        <label>
          <input
            type="radio"
            name="year"
            value="2008"
            checked={year === 2008}
            onChange={() => setYear(2008)}
          />
          2008
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            name="year"
            value="2018"
            checked={year === 2018}
            onChange={() => setYear(2018)}
          />
          2018
        </label>
      </div>
      <svg ref={ref}></svg>
    </div>
  );
}
