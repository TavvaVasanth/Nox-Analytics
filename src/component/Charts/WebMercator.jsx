import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { tile } from "d3-tile";

// Helper function for Web Mercator tile filenames
const url = (x, y, z) => 
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

const WebMercator = ({ width = 800 }) => {
  const ref = useRef();

  useEffect(() => {
    const height = Math.min(width, 720);

    const svg = d3.select(ref.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height);

    // Background rectangle so you see the SVG area
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#f8f8f8");

    const projection = d3.geoMercator();
    const path = d3.geoPath(projection);

    // Load both JSON files using fetch
    Promise.all([
      fetch("/land-50m.json").then(res => {
        if (!res.ok) throw new Error(`Failed to load land-50m.json: ${res.status}`);
        return res.json();
      }),
      fetch("/detroit.json").then(res => {
        if (!res.ok) throw new Error(`Failed to load detroit.json: ${res.status}`);
        return res.json();
      })
    ])
      .then(([landTopo, detroitTopo]) => {
        const land = topojson.feature(landTopo, landTopo.objects.land);
        const detroit = topojson.feature(detroitTopo, detroitTopo.objects.detroit);

        // Fit projection to Detroit
        projection.fitSize([width, height], detroit);

        // Tile setup
        const t = tile()
          .size([width, height])
          .scale(projection.scale() * 2 * Math.PI)
          .translate(projection([0, 0]));

        const tiles = t();

        // Render tiles
        svg.selectAll("image")
          .data(tiles)
          .join("image")
          .attr("xlink:href", d => url(d[0], d[1], d[2]))
          .attr("x", d => (d[0] + tiles.translate[0]) * tiles.scale)
          .attr("y", d => (d[1] + tiles.translate[1]) * tiles.scale)
          .attr("width", tiles.scale)
          .attr("height", tiles.scale);

        // Draw Detroit boundary
        svg.append("path")
          .datum(detroit)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("d", path);
      })
      .catch(err => {
        console.error("Error loading JSON files:", err);
      });
  }, [width]);

  return <svg ref={ref}></svg>;
};

export default WebMercator;
