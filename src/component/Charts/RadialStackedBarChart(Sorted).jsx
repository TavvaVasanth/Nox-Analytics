import { useEffect, useRef } from "react";
import * as d3 from "d3";
export default function Radial(){
    const ref=useRef()
    const data = [
  // New York
  { state: "New York", age: "under 5", population: 120000 },
  { state: "New York", age: "5-16", population: 350000 },
  { state: "New York", age: "18-25", population: 220000 },
  { state: "New York", age: "25-40", population: 410000 },

  // Los Angeles
  { state: "Los Angeles", age: "under 5", population: 95000 },
  { state: "Los Angeles", age: "5-16", population: 280000 },
  { state: "Los Angeles", age: "18-25", population: 200000 },
  { state: "Los Angeles", age: "25-40", population: 390000 },

  // Chicago
  { state: "Chicago", age: "under 5", population: 80000 },
  { state: "Chicago", age: "5-16", population: 210000 },
  { state: "Chicago", age: "18-25", population: 150000 },
  { state: "Chicago", age: "25-40", population: 320000 },

  // Houston
  { state: "Houston", age: "under 5", population: 70000 },
  { state: "Houston", age: "5-16", population: 190000 },
  { state: "Houston", age: "18-25", population: 140000 },
  { state: "Houston", age: "25-40", population: 300000 },

  // Phoenix
  { state: "Phoenix", age: "under 5", population: 60000 },
  { state: "Phoenix", age: "5-16", population: 160000 },
  { state: "Phoenix", age: "18-25", population: 120000 },
  { state: "Phoenix", age: "25-40", population: 250000 },

  // Philadelphia
  { state: "Philadelphia", age: "under 5", population: 75000 },
  { state: "Philadelphia", age: "5-16", population: 170000 },
  { state: "Philadelphia", age: "18-25", population: 130000 },
  { state: "Philadelphia", age: "25-40", population: 280000 },

  // San Antonio
  { state: "San Antonio", age: "under 5", population: 65000 },
  { state: "San Antonio", age: "5-16", population: 150000 },
  { state: "San Antonio", age: "18-25", population: 110000 },
  { state: "San Antonio", age: "25-40", population: 240000 }
];
    useEffect(()=>{
const width = 928;
  const height = width;
  const innerRadius = 180;
  const outerRadius = width / 2 - 40;
d3.select(ref.current).selectAll("*").remove();
  // Stack the data into series by age
  const series = d3.stack()
      .keys(d3.union(data.map(d => d.age))) // distinct series keys, in input order
      .value(([, D], key) => D.get(key).population) // get value for each series key and stack
    (d3.index(data, d => d.state, d => d.age)); // group by stack then series key

  const arc = d3.arc()
      .innerRadius(d => y(d[0]))
      .outerRadius(d => y(d[1]))
      .startAngle(d => x(d.data[0]))
      .endAngle(d => x(d.data[0]) + x.bandwidth())
      .padAngle(1.5 / innerRadius)
      .padRadius(innerRadius);

  // An angular x-scale
  const x = d3.scaleBand()
      .domain(d3.groupSort(data, D => -d3.sum(D, d => d.population), d => d.state))
      .range([0, 2 * Math.PI])
      .align(0);

  // A radial y-scale maintains area proportionality of radial bars
  const y = d3.scaleRadial()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .range([innerRadius, outerRadius]);

  const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(d3.schemeSpectral[series.length])
      .unknown("#ccc");

  // A function to format the value in the tooltip
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height/2, width, height])
      .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

  // A group for each series, and a rect for each element in the series
  svg.append("g")
    .selectAll()
    .data(series)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("path")
    .data(D => D.map(d => (d.key = D.key, d)))
    .join("path")
      .attr("d", arc)
    .append("title")
      .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).population)}`);

  // x axis
  svg.append("g")
      .attr("text-anchor", "middle")
    .selectAll()
    .data(x.domain())
    .join("g")
      .attr("transform", d => `
        rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
        translate(${innerRadius},0)
      `)
      .call(g => g.append("line")
          .attr("x2", -5)
          .attr("stroke", "#000"))
      .call(g => g.append("text")
          .attr("transform", d => (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
              ? "rotate(90)translate(0,16)"
              : "rotate(-90)translate(0,-9)")
          .text(d => d));

  // y axis
  svg.append("g")
      .attr("text-anchor", "end")
      .call(g => g.append("text")
          .attr("x", -6)
          .attr("y", d => -y(y.ticks(10).pop()))
          .attr("dy", "-1em")
          .text("Population"))
      .call(g => g.selectAll("g")
        .data(y.ticks(10).slice(1))
        .join("g")
          .attr("fill", "none")
          .call(g => g.append("circle")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.5)
              .attr("r", y))
          .append("text")
              .attr("x", -6)
              .attr("y", d => -y(d))
              .attr("dy", "0.35em")
              .attr("paint-order", "stroke")
              .attr("stroke", "#fff")
              .attr("fill", "#000")
              .attr("stroke-width", 5)
              .text(y.tickFormat(5, "s")));

  // color legend
  svg.append("g")
    .selectAll()
    .data(color.domain())
    .join("g")
      .attr("transform", (d, i, nodes) => `translate(-40,${(nodes.length / 2 - i - 1) * 20})`)
      .call(g => g.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", color))
      .call(g => g.append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .text(d => d))
    },[])
    return <svg ref={ref}></svg>;
}