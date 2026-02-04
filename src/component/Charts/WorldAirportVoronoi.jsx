import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { geoVoronoi } from "d3-geo-voronoi";
import versor from "versor";

export default function WorldAirportVoronoi() {
  const canvasRef = useRef();
  const [points, setAirports] = useState(null);

  useEffect(() => {
    d3.csv("/World-airports.csv", d => ({
      name: d.name,
      longitude: +d.longitude,
      latitude: +d.latitude
    })).then(setAirports);
  }, []);

  useEffect(() => {
    if (!points) return;

    const width = 960;
    const height = 500;
    const context = canvasRef.current.getContext("2d");

    const sphere = { type: "Sphere" };
    const graticule = d3.geoGraticule10();

    // --- mutable projection ---
    let projection = d3.geoOrthographic()
      .fitExtent([[1, 1], [width - 1, height - 1]], sphere)
      .rotate([0, -30]);

    const path = d3.geoPath(projection, context).pointRadius(1.5);

    const airportFeatures = points.map(d => ({
      type: "Feature",
      properties: d,
      geometry: {
        type: "Point",
        coordinates: [d.longitude, d.latitude]
      }
    }));

    const mesh = geoVoronoi(airportFeatures).cellMesh();

    function render() {
      context.clearRect(0, 0, width, height);

      context.beginPath();
      path(graticule);
      context.lineWidth = 0.5;
      context.strokeStyle = "#aaa";
      context.stroke();

      context.beginPath();
      path(mesh);
      context.lineWidth = 0.5;
      context.strokeStyle = "#000";
      context.stroke();

      context.beginPath();
      path(sphere);
      context.lineWidth = 1.5;
      context.strokeStyle = "#000";
      context.stroke();

      context.beginPath();
      path({ type: "MultiPoint", coordinates: points.map(d => [d.longitude, d.latitude]) });
      context.fillStyle = "#f00";
      context.fill();
    }

    // --- drag logic with versor ---
    let v0, r0;
    d3.select(canvasRef.current)
      .call(
        d3.drag()
          .on("start", (event) => {
            v0 = versor.cartesian(projection.invert([event.x, event.y]));
            r0 = projection.rotate();
          })
          .on("drag", (event) => {
            const v1 = versor.cartesian(projection.rotate(r0).invert([event.x, event.y]));
            const q = versor.multiply(versor.delta(v0, v1), versor.rotation(r0));
            projection.rotate(versor.rotation(q)); // <-- mutate projection
            render();
          })
      );

    render();
  }, [points]);

  return <canvas ref={canvasRef} width={960} height={500} style={{ maxWidth: "100%" }} />;
}
