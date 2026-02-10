// GraticuleLabels.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function GraticuleLabels({
  width = 800,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 20,
  marginLeft = 20,
  longitude = 0
}) {
  const svgRef = useRef();
  const [worldData, setWorldData] = useState(null);

  // Fetch TopoJSON once
  useEffect(() => {
    fetch("/land-50m.json") // adjust path or URL as needed
      .then(res => res.json())
      .then(data => setWorldData(data))
      .catch(err => console.error("Failed to load world data:", err));
  }, []);

  useEffect(() => {
    if (!worldData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoStereographic().rotate([-longitude, 0]);
    const path = d3.geoPath(projection);

    const outline = d3.geoCircle().radius(90).center([longitude, 0])();
    const graticule = d3.geoGraticule10();
    const land = topojson.feature(worldData, worldData.objects.land);

    // Fit projection to width
    const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
    const dx = x1 - x0;
    const k = (dx - marginLeft - marginRight) / dx;
    const dy = (y1 - y0) * k + marginBottom + marginTop;
    projection.scale(projection.scale() * k);
    projection.translate([(dx + marginLeft - marginRight) / 2, (dy + marginTop - marginBottom) / 2]);
    projection.precision(0.2);
    const height = Math.round(dy);

    const offset = ([x, y], k) => {
      const [cx, cy] = projection.translate();
      const dx = x - cx, dy = y - cy;
      k /= Math.hypot(dx, dy);
      return [x + dx * k, y + dy * k];
    };

    const formatLatitude = y => `${Math.abs(y)}°${y < 0 ? "S" : "N"}`;
    const formatLongitude = x => `${Math.abs(x)}°${x < 0 ? "W" : "E"}`;

    // Clip paths
    svg.append("defs").append("clipPath")
      .attr("id", "clipIn")
      .append("path")
      .attr("d", path(outline));

    svg.append("defs").append("clipPath")
      .attr("id", "clipOut")
      .append("path")
      .attr("d", `M0,0V${height}H${width}V0Z${path(outline)}`);

    // Graticule
    svg.append("path")
      .attr("d", path(graticule))
      .attr("stroke", "#ccc")
      .attr("fill", "none");

    // Land inside
    svg.append("path")
      .attr("clip-path", "url(#clipIn)")
      .attr("d", path(land));

    // Land outside
    svg.append("path")
      .attr("fill-opacity", 0.1)
      .attr("clip-path", "url(#clipOut)")
      .attr("d", path(land));

    // Outline
    svg.append("path")
      .attr("d", path(outline))
      .attr("stroke", "#000")
      .attr("fill", "none");

    // Latitude labels
    const g = svg.append("g")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

    d3.range(-80, 81, 10).forEach(y => {
      g.append("text")
        .attr("transform", `translate(${offset(projection([longitude + 90, y]), 10)})`)
        .attr("dy", "0.35em")
        .attr("x", 6)
        .text(formatLatitude(y));

      g.append("text")
        .attr("transform", `translate(${offset(projection([longitude - 90, y]), 10)})`)
        .attr("dy", "0.35em")
        .attr("x", -6)
        .text(formatLatitude(y));
    });

    svg.attr("width", width).attr("height", height);

  }, [worldData, width, marginTop, marginRight, marginBottom, marginLeft, longitude]);

  return <svg ref={svgRef} style={{ display: "block" }} />;
}
