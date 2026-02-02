import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function Inline() {
  const [data, setData] = useState([]);
  const ref = useRef();

  useEffect(() => {
    fetch("/fruits.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 928;
    const height = 500;
    const marginTop = 30;
    const marginRight = 150; // extra space for legend
    const marginBottom = 30;
    const marginLeft = 30;

    const fruits = ["Apples", "Blueberries", "Carrots"];
    const parsedData = data.flatMap((d) =>
      fruits.map((fruit) => ({
        fruit,
        value: +d[fruit],
        date: d3.utcParse("%m/%d/%y")(d.Date),
      }))
    );


    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const x = d3
      .scaleUtc()
      .domain(d3.extent(parsedData, (d) => d.date))
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleUtc()
      .domain([0, d3.max(parsedData, (d) => d.value)])
      .range([height - marginBottom, marginTop]);

    const color = d3
      .scaleOrdinal()
      .domain(fruits)
      .range(d3.schemeCategory10);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));
    //Y axis
    svg.append("g")
    .attr("transform",`translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).ticks(height/80).tickSizeOuter(0));
    // Group by fruit
    const serie = svg
      .append("g")
      .selectAll()
      .data(d3.group(parsedData, (d) => d.fruit))
      .join("g");
    // Draw lines
    serie
      .append("path")
      .attr("fill", "none")
      .attr("stroke", (d) => color(d[0]))
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        (d) =>
          d3
            .line()
            .x((d) => x(d.date))
            .y((d) => y(d.value))(d[1])
      );
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - marginRight + 20},${marginTop})`);

    fruits.forEach((fruit, i) => {
      const g = legend.append("g").attr("transform", `translate(0,${i * 20})`);
      g.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", color(fruit))
        .attr("stroke-width", 2);
      g.append("text")
        .attr("x", 25)
        .attr("y", 4)
        .text(fruit)
        .style("font-size", "12px")
        .style("fill", color(fruit));
    });
  }, [data]);

  return <svg ref={ref}></svg>;
}
