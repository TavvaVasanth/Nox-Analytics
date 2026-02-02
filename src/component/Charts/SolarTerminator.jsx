import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import * as solar from "solar-calculator";

export default function SolarTerminator() {
  const canvasRef = useRef(null);
  const [world, setWorld] = useState(null);

  // Load world topojson
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json")
      .then((res) => res.json())
      .then(setWorld);
  }, []);

  useEffect(() => {
    if (!world) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const width = 960;
    const Sphere = { type: "Sphere" };
    const graticule = d3.geoGraticule10();
    const land = topojson.feature(world, world.objects.land);

    // Projection setup
    const projection = d3.geoNaturalEarth1().fitWidth(width, Sphere);
    const path = d3.geoPath(projection, context);
    const [[, y0], [, y1]] = path.bounds(Sphere);
    const height = Math.ceil(y1 - y0);

    canvas.width = width;
    canvas.height = height;

    // --- Solar position ---
    const now = new Date();
    const day = new Date(+now).setUTCHours(0, 0, 0, 0);
    const t = solar.century(now);
    const longitude = (day - now) / 864e5 * 360 - 180;
    const sun = [
      longitude - solar.equationOfTime(t) / 4,
      solar.declination(t),
    ];

    const antipode = ([lon, lat]) => [lon + 180, -lat];

    const night = d3.geoCircle()
      .radius(90)
      .center(antipode(sun))();

    // --- Drawing ---
    context.clearRect(0, 0, width, height);

    // Graticule
    context.beginPath();
    path(graticule);
    context.strokeStyle = "#ccc";
    context.stroke();

    // Land
    context.beginPath();
    path(land);
    context.fillStyle = "#000";
    context.fill();

    // Night hemisphere
    context.beginPath();
    path(night);
    context.fillStyle = "rgba(0,0,255,0.3)";
    context.fill();

    // Outline
    context.beginPath();
    path(Sphere);
    context.strokeStyle = "#000";
    context.stroke();
  }, [world]);

  return <canvas ref={canvasRef}></canvas>;
}
