import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function Voronoi() {
  const ref = useRef();

  useEffect(() => {
    const width = 800;
    const height = 500;

    // Generate random points
    const randomX = d3.randomNormal(width / 2, 80);
    const randomY = d3.randomNormal(height / 2, 80);
    const data = d3.range(200)
      .map(() => [randomX(), randomY()])
      .filter(d => 0 <= d[0] && d[0] <= width && 0 <= d[1] && d[1] <= height);

    // Build delaunay + voronoi
    const delaunay = d3.Delaunay.from(data);
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    // Clear previous render
    d3.select(ref.current).selectAll("*").remove();

    const svg = d3.select(ref.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

    // Draw Voronoi cells
    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", voronoi.render());

    // Draw points
    svg.append("path")
      .attr("fill", "black")
      .attr("d", delaunay.renderPoints(null, 2));

    // Optional: draw connecting lines from centroid to point
    const cells = data.map((d, i) => [d, voronoi.cellPolygon(i)]);
    svg.append("g")
      .attr("stroke", "orange")
      .selectAll("path")
      .data(cells)
      .join("path")
      .attr("d", ([d, cell]) => `M${d3.polygonCentroid(cell)}L${d}`);
  }, []);

  return <svg ref={ref}></svg>;
}
