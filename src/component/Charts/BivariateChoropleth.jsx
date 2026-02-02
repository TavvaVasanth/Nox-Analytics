import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function BivariateChoropleth(){
    const n = 3
    const schemes = [
  {
    name: "RdBu", 
    colors: [
      "#e8e8e8", "#e4acac", "#c85a5a",
      "#b0d5df", "#ad9ea5", "#985356",
      "#64acbe", "#627f8c", "#574249"
    ]
  },
  {
    name: "BuPu", 
    colors: [
      "#e8e8e8", "#ace4e4", "#5ac8c8",
      "#dfb0d6", "#a5add3", "#5698b9", 
      "#be64ac", "#8c62aa", "#3b4994"
    ]
  },
  {
    name: "GnBu", 
    colors: [
      "#e8e8e8", "#b5c0da", "#6c83b5",
      "#b8d6be", "#90b2b3", "#567994",
      "#73ae80", "#5a9178", "#2a5a5b"
    ]
  },
  {
    name: "PuOr", 
    colors: [
      "#e8e8e8", "#e4d9ac", "#c8b35a",
      "#cbb8d7", "#c8ada0", "#af8e53",
      "#9972af", "#976b82", "#804d36"
    ]
  }
]
const labels = ["low", "", "high"]
const ref = useRef();
  const [data, setData] = useState([]);
  const [us, setUS] = useState(null);
  const [schemeIndex, setSchemeIndex] = useState(0);

  useEffect(() => {
      d3.csv("/cdc_diabetes_obesity_2020.csv", d => ({
        county: String(d.county).padStart(5, "0"),
        diabetes: d.diabetes,
        obesity: +d.obesity
      })).then(setData);
  
      fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
        .then(res => res.json())
        .then(setUS);
    }, []);
    useEffect(() => {
  if (!us || data.length === 0) return;

  const svg = d3.select(ref.current);
  svg.selectAll("*").remove();

  const width = 975;
  const height = 610;
  const scheme = schemes[schemeIndex];
;

  const index = new Map(
    data.map(d => [d.county, d])
  );

  const x = d3.scaleQuantile(
    data.map(d => d.diabetes),
    d3.range(n)
  );

  const y = d3.scaleQuantile(
    data.map(d => d.obesity),
    d3.range(n)
  );

  const states = topojson.feature(us, us.objects.states);

  svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  svg.append(() =>
    legend({ n, colors: scheme.colors, labels })
  )
  .attr("transform", "translate(870,450)");

  const projection = d3.geoAlbersUsa()
    .fitSize([width, height], states);

  const path = d3.geoPath(projection);

  const color = value => {
    if (!value) return "#ccc";
    return scheme.colors[y(value.obesity) + x(value.diabetes) * n];
  };

  svg.append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("fill", d => color(index.get(d.id)))
    .attr("d", path)
    .append("title")
    .text(d => {
      const v = index.get(d.id);
      return v
        ? `${v.diabetes}% Diabetes\n${v.obesity}% Obesity`
        : "No data";
    });

  svg.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path);
}, [us, data ,schemeIndex]);

return<>
<div className="form-group">
  <div className="form-label">
    <p>Color Schemas:</p>
  </div>
  
    <select className="form-control"
  value={schemeIndex}
  onChange={e => setSchemeIndex(+e.target.value)}
  style={{ }}
>
 
  {schemes.map((s, i) => (
    <option key={s.name} value={i}>
      {s.name}
    </option>
  ))}
</select>
  
</div>
   


 <svg ref={ref}></svg>
 </>
}
function legend({ n, colors, labels }) {
  const k = 24;
  const arrowId = "arrow-" + Math.random().toString(36).slice(2);

  const g = d3.create("svg:g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10);

  const inner = g.append("g")
    .attr("transform", `translate(-${(k * n) / 2},-${(k * n) / 2}) rotate(-45 ${(k * n) / 2},${(k * n) / 2})`);

  inner.append("defs").append("marker")
    .attr("id", arrowId)
    .attr("markerHeight", 10)
    .attr("markerWidth", 10)
    .attr("refX", 6)
    .attr("refY", 3)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0L9,3L0,6Z");

  d3.cross(d3.range(n), d3.range(n)).forEach(([i, j]) => {
    inner.append("rect")
      .attr("width", k)
      .attr("height", k)
      .attr("x", i * k)
      .attr("y", (n - 1 - j) * k)
      .attr("fill", colors[j * n + i])
      .append("title")
      .text(`Diabetes${labels[j] ? ` (${labels[j]})` : ""}\nObesity${labels[i] ? ` (${labels[i]})` : ""}`);
  });

  inner.append("line")
    .attr("marker-end", `url(#${arrowId})`)
    .attr("x1", 0)
    .attr("x2", n * k)
    .attr("y1", n * k)
    .attr("y2", n * k)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5);

  inner.append("line")
    .attr("marker-end", `url(#${arrowId})`)
    .attr("y2", 0)
    .attr("y1", n * k)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5);

  inner.append("text")
    .attr("font-weight", "bold")
    .attr("dy", "0.71em")
    .attr("transform", `rotate(90) translate(${(n / 2) * k},6)`)
    .attr("text-anchor", "middle")
    .text("Diabetes");

  inner.append("text")
    .attr("font-weight", "bold")
    .attr("dy", "0.71em")
    .attr("transform", `translate(${(n / 2) * k},${n * k + 6})`)
    .attr("text-anchor", "middle")
    .text("Obesity");

  return g.node();
}
