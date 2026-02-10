import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function SpilhausShorelineMap() {
  const canvasRef = useRef(null);
  const [worldData, setWorldData] = useState(null);

  useEffect(() => {
    // Fetch TopoJSON file from public folder
    fetch("/land-50m.json")
      .then((res) => res.json())
      .then((data) => setWorldData(data))
      .catch((err) => console.error("Error loading world data:", err));
  }, []);

  useEffect(() => {
    if (!worldData) return;

    const width = 928;
    const height = width;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const projection = d3.geoStereographic()
      .rotate([95, 45])
      .translate([width / 2, height / 2])
      .scale(width / 10.1)
      .center([30, -5])
      .clipAngle(166);

    const path = d3.geoPath(projection, context);
    const land = topojson.feature(worldData, worldData.objects.land);

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Background
    context.lineJoin = "round";
    context.lineCap = "round";
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);

    // Sphere + land outline
    context.beginPath();
    path({ type: "Sphere" });
    path(land);
    context.lineWidth = 0.5;
    context.stroke();
    context.clip("evenodd");

    // Blurred land shadow
    context.save();
    context.beginPath();
    path(land);
    context.filter = "blur(12px)";
    context.fillStyle = "#aaa";
    context.fill("evenodd");
    context.restore();

    // Graticule
    context.beginPath();
    path(d3.geoGraticule10());
    context.globalAlpha = 0.2;
    context.strokeStyle = "#000";
    context.stroke();

  }, [worldData]);

  return <canvas ref={canvasRef} width={928} height={928} />;
}
