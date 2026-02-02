import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const SmoothZoom = () => {
  const svgRef = useRef();

  useEffect(() => {
    const width = 800;
    const height = 500;

    const circles = [
      { id: 1, x: 100, y: 150, r: 60, color: "steelblue" },
      { id: 2, x: 250, y: 80, r: 40, color: "tomato" },
      { id: 3, x: 400, y: 200, r: 70, color: "green" },
      { id: 4, x: 500, y: 300, r: 50, color: "orange" },
    ];

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("border", "1px solid #ccc")
      .style("cursor", "pointer");

    // Reset background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .lower()
      .on("click", () => {
        zoomTo(width / 2, height / 2, width / 2); // Reset zoom
      });

    // Append circles
    svg.selectAll("circle")
      .data(circles)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("fill", d => d.color)
      .style("cursor", "zoom-in")
      .on("click", (event, d) => {
        event.stopPropagation(); // prevent background zoom
        zoomTo(d.x, d.y, d.r);
      });

    // Zoom function
    const zoomTo = (x, y, radius) => {
      const i = d3.interpolateZoom(
        [width / 2, height / 2, width],
        [x, y, radius * 2]
      );

      svg.transition()
        .duration(1000)
        .tween("zoom", () => t => {
          const [cx, cy, w] = i(t);
          svg.attr("viewBox", [
            cx - w / 2,
            cy - (w * height) / width / 2,
            w,
            (w * height) / width
          ]);
        });
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <svg
        ref={svgRef}
        className="w-full h-[500px] rounded shadow"
      ></svg>
    </div>
  );
};

export default SmoothZoom;
