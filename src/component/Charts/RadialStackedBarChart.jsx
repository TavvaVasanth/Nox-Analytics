import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function RadialStackedBarChart({ data }) {
  const ref = useRef();

  useEffect(() => {
    const width = 928;
    const height = width;
    const innerRadius = 180;
    const outerRadius =  width/ 2-40;

    // Prepare the dataset: group by Change Type, then count by Priority
    const grouped = d3.rollup(
      data,
      v => ({
        High: v.filter(d => d.Priority === "High").length,
        Medium: v.filter(d => d.Priority === "Medium").length,
        Low: v.filter(d => d.Priority === "Low").length
      }),
      d => d["Change Type"]
    );

    const formattedData = Array.from(grouped, ([type, counts]) => ({
      type,
      ...counts
    }));

    // Stack the data into series
    const series = d3.stack()
      .keys(["High", "Medium", "Low"])
      (formattedData.map(d => ({
        state: d.type,
        High: d.High,
        Medium: d.Medium,
        Low: d.Low
      })));

    const x = d3.scaleBand()
      .domain(formattedData.map(d => d.type))
      .range([0, 2 * Math.PI])
      .align(0);

    const y = d3.scaleRadial()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .range([innerRadius, outerRadius]);

    const color = d3.scaleOrdinal()
      .domain(["High", "Medium", "Low"])
      .range(["#EF4444", "#F59E0B", "#10B981"]); // red, orange, green

    const arc = d3.arc()
      .innerRadius(d => y(d[0]))
      .outerRadius(d => y(d[1]))
      .startAngle(d => x(d.data.state))
      .endAngle(d => x(d.data.state) + x.bandwidth())
      .padAngle(1.5 / innerRadius)
      .padRadius(innerRadius);

    // Clear previous render
    d3.select(ref.current).selectAll("*").remove();

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

    // Draw series
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
        .text(d => `${d.data.state} ${d.key}: ${d.data[d.key]}`);

    // X axis labels
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

    // Legend
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
            .text(d => d));
  }, [data]);

  return <svg ref={ref}></svg>;
}
