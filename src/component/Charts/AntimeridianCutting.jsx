import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function AntimeridianCutting() {
  const canvasRef = useRef(null);
  const [world, setWorld] = useState(null);

  useEffect(() => {
    fetch("/land-110m.json")
      .then(r => r.json())
      .then(setWorld);
  }, []);

  useEffect(() => {
    if (!world) return;

    const land = topojson.feature(world, world.objects.land);
    const width = 960;
    const height = 500;
    const devicePixelRatio = window.devicePixelRatio;

    const canvas = canvasRef.current;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");

    const projection = d3.geoConicEqualArea()
      .scale(150 * devicePixelRatio)
      .center([0, 33])
      .translate([width * devicePixelRatio / 2, height * devicePixelRatio / 2])
      .precision(0.3);

    const path = d3.geoPath().projection(projection).context(ctx);

    let frame;
    let x0, y0;
    let lambda0, phi0;

    canvas.onpointermove = (event) => {
      if (!event.isPrimary) return;
      const [x, y] = d3.pointer(event);
      render([
        lambda0 + (x - x0) / (width * devicePixelRatio) * 360,
        phi0 - (y - y0) / (height * devicePixelRatio) * 360
      ]);
    };

    canvas.ontouchstart = (event) => event.preventDefault();

    canvas.onpointerenter = (event) => {
      if (!event.isPrimary) return;
      cancelAnimationFrame(frame);
      ([x0, y0] = d3.pointer(event));
      ([lambda0, phi0] = projection.rotate());
    };

    canvas.onpointerleave = (event) => {
      if (!event.isPrimary) return;
      frame = requestAnimationFrame(tick);
    };

    function tick() {
      const [lambda, phi] = projection.rotate();
      render([lambda + 0.1, phi + 0.1]);
      frame = requestAnimationFrame(tick);
    }

    function render(rotate) {
      projection.rotate(rotate);
      ctx.clearRect(0, 0, width * devicePixelRatio, height * devicePixelRatio);
      ctx.beginPath();
      path(land);
      ctx.fill();
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.lineWidth = devicePixelRatio;
      ctx.stroke();
    }

    tick();

    // ✅ React cleanup
    return () => {
      cancelAnimationFrame(frame);
      canvas.onpointermove = null;
      canvas.onpointerenter = null;
      canvas.onpointerleave = null;
      canvas.ontouchstart = null;
    };
  }, [world]);

  return <canvas ref={canvasRef} />;
}
