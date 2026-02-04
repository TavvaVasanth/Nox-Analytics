import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { geoVoronoi } from "d3-geo-voronoi";

export default function UsAirportVoronoi() {
  const ref = useRef();
  const [us, setUs] = useState(null);
  const [airports, setAirports] = useState(null);

  // Load map and airport data once
  useEffect(() => {
    fetch("/states-albers-10m.json")
      .then(res => res.json())
      .then(setUs);

    d3.csv("/airports.csv", d => ({
      iata: d.iata,
      name: d.name,
      city: d.city,
      state: d.state,
      country: d.country,
      latitude: +d.latitude,   // convert to number
      longitude: +d.longitude  // convert to number
    })).then(setAirports);
  }, []);

  // Render map + Voronoi once data is ready
  useEffect(() => {
    if (!us?.objects || !airports) return;

    const projection = d3.geoAlbers()
      .scale(1300)
      .translate([487.5, 305]);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // clear previous render

    svg.attr("viewBox", [0, 0, 975, 610])
      .attr("width", 975)
      .attr("height", 610)
      .attr("style", "max-width: 100%; height: auto;");

    // Draw US states
    svg.append("path")
      .datum(
        topojson.merge(
          us,
          us.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15")
        )
      )
      .attr("fill", "#ddd")
      .attr("d", d3.geoPath());

    svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath());

    // Convert airports to GeoJSON features
    const airportFeatures = airports.map(d => ({
      type: "Feature",
      properties: d,
      geometry: {
        type: "Point",
        coordinates: [d.longitude, d.latitude]
      }
    }));

    // Draw Voronoi polygons
    svg.append("g")
  .attr("fill", "none")
  .attr("stroke", "red")
  .attr("pointer-events", "all")
  .selectAll("path")
  .data(geoVoronoi().polygons(airportFeatures).features)
  .join("path")
  .attr("d", d3.geoPath(projection))
  .append("title")
  .text(d => {
    const p = d.properties.site.properties;
    return `${p.name} Airport\n${p.city}, ${p.state}`;
  });


    // Draw airport points
    svg.append("path")
      .datum({ type: "FeatureCollection", features: airportFeatures })
      .attr("d", d3.geoPath(projection).pointRadius(1.5));
  }, [us, airports]);

  return <svg ref={ref}></svg>;
}

