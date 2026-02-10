import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MirroredBeeswarm = () => {
  const ref = useRef();
  const [cars, setCars] = useState([]);

  useEffect(() => {
    // Fetch the JSON file from public folder
    fetch("/cars.json")
      .then(response => response.json())
      .then(data => setCars(data))
      .catch(error => console.error("Error loading data:", error));
  }, []);

  useEffect(() => {
    if (!Array.isArray(cars) || cars.length === 0) return;

    const width = 928;
    const height = 160;
    const marginRight = 20;
    const marginLeft = 20;
    const marginBottom = 20;

    const radius = 3;
    const padding = 1.5;

    const weights = cars.map(d => +d["weight (lb)"]).filter(v => !isNaN(v));
    if (weights.length === 0) return;

    const x = d3.scaleLinear()
      .domain(d3.extent(weights))
      .range([marginLeft, width - marginRight]);

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    svg.selectAll("*").remove();

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Beeswarm dots
    svg.append("g")
      .selectAll("circle")
      .data(dodge(cars, { radius: radius * 2 + padding, x: d => x(+d["weight (lb)"]) }))
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => height / 2 - radius - padding - d.y)
      .attr("r", radius)
      .append("title")
      .text(d => d.data.name);

  }, [cars]);

  return <svg ref={ref}></svg>;
};

// Dodge function
function dodge(data, { radius, x }) {
  const radius2 = radius ** 2;
  const circles = data.map(d => ({ x: x(d), data: d })).sort((a, b) => a.x - b.x);
  const epsilon = 1e-3;
  let head = null, tail = null;

  function intersects(x, y) {
    let a = head;
    while (a) {
      if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }

  for (const b of circles) {
    while (head && head.x < b.x - radius2) head = head.next;

    if (intersects(b.x, b.y = 0)) {
      let a = head;
      b.y = Infinity;
      do {
        let y1 = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
        let y2 = a.y - Math.sqrt(radius2 - (a.x - b.x) ** 2);
        if (Math.abs(y1) < Math.abs(b.y) && !intersects(b.x, y1)) b.y = y1;
        if (Math.abs(y2) < Math.abs(b.y) && !intersects(b.x, y2)) b.y = y2;
        a = a.next;
      } while (a);
    }

    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return circles;
}

export default MirroredBeeswarm;
