import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function VectorField() {
  const [world, setWorld] = useState(null);
  const [wind, setWind] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Load basemap
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json")
      .then(res => res.json())
      .then(setWorld);

    // Load wind data
    d3.csv("/wind.csv", d => ({
      longitude: +d.longitude,
      latitude: +d.latitude,
      dir: +d.dir,
      speed: +d.speed
    })).then(setWind);
  }, []);

  useEffect(() => {
    if (!world || !wind) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const width = 1000;
    const margin = 10;

    const projection = d3.geoEquirectangular();
    const points = { type: "MultiPoint", coordinates: wind.map(d => [d.longitude, d.latitude]) };
    const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width - margin * 2, points)).bounds(points);
    const [tx, ty] = projection.translate();
    const height = Math.ceil(y1 - y0) + margin * 2;

    canvas.width = width;
    canvas.height = height;

    projection.translate([tx + margin, ty + margin]);

    const land = topojson.feature(world, world.objects.land);
    const path = d3.geoPath(projection, context);

    const length = d3.scaleSqrt([0, d3.max(wind, d => d.speed)], [0, 3]);
    const color = d3.scaleSequential([0, 360], d3.interpolateRainbow);

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw land
    context.strokeStyle = "black";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "white";
    context.lineWidth = 1;
    context.beginPath();
    path(land);
    context.stroke();

    // Draw wind arrows
    for (const { longitude, latitude, speed, dir } of wind) {
  context.save();
  context.translate(...projection([longitude, latitude]));
  context.scale(length(speed), length(speed));
  context.rotate((dir * Math.PI) / 180);
  context.beginPath();
  context.moveTo(-2, -2);
  context.lineTo(2, -2);
  context.lineTo(0, 8);
  context.closePath();
  context.fillStyle = color(dir); // rainbow arrows
  context.fill();
  context.restore();
}

  }, [world, wind]);

  return <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />;
}
