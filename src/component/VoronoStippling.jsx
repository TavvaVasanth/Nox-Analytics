// VoronoStippling.jsx
import React, { useEffect, useRef } from "react";

export default function VoronoStippling({ imageSrc, width = 600 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });


    let worker;

    async function init() {
      // Load image
      const img = new Image();
      img.src = imageSrc;
      await img.decode();

      const height = Math.round(width * img.height / img.width);
      canvas.width = width;
      canvas.height = height;

      context.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);

      const { data: rgba } = context.getImageData(0, 0, width, height);
      const data = new Float64Array(width * height);
      for (let i = 0, n = rgba.length / 4; i < n; ++i) {
        data[i] = Math.max(0, 1 - rgba[i * 4] / 254);
      }

      const n = Math.round(width * height / 40);

      // Worker script
      const blob = new Blob([`
        importScripts("https://cdn.observableusercontent.com/npm/d3-delaunay@6.0.4/dist/d3-delaunay.min.js");

        onmessage = event => {
          const {data: {data, width, height, n}} = event;
          const points = new Float64Array(n * 2);
          const c = new Float64Array(n * 2);
          const s = new Float64Array(n);

          for (let i = 0; i < n; ++i) {
            for (let j = 0; j < 30; ++j) {
              const x = points[i * 2] = Math.floor(Math.random() * width);
              const y = points[i * 2 + 1] = Math.floor(Math.random() * height);
              if (Math.random() < data[y * width + x]) break;
            }
          }

          const delaunay = new d3.Delaunay(points);
          const voronoi = delaunay.voronoi([0, 0, width, height]);

          for (let k = 0; k < 80; ++k) {
            c.fill(0);
            s.fill(0);
            for (let y = 0, i = 0; y < height; ++y) {
              for (let x = 0; x < width; ++x) {
                const w = data[y * width + x];
                i = delaunay.find(x + 0.5, y + 0.5, i);
                s[i] += w;
                c[i * 2] += w * (x + 0.5);
                c[i * 2 + 1] += w * (y + 0.5);
              }
            }

            const w = Math.pow(k + 1, -0.8) * 10;
            for (let i = 0; i < n; ++i) {
              const x0 = points[i * 2], y0 = points[i * 2 + 1];
              const x1 = s[i] ? c[i * 2] / s[i] : x0;
              const y1 = s[i] ? c[i * 2 + 1] / s[i] : y0;
              points[i * 2] = x0 + (x1 - x0) * 1.8 + (Math.random() - 0.5) * w;
              points[i * 2 + 1] = y0 + (y1 - y0) * 1.8 + (Math.random() - 0.5) * w;
            }

            postMessage(points);
            voronoi.update();
          }
          close();
        };
      `], { type: "text/javascript" });

      const script = URL.createObjectURL(blob);
      worker = new Worker(script);

      worker.onmessage = ({ data: points }) => {
        context.fillStyle = "#fff";
        context.fillRect(0, 0, width, height);
        context.beginPath();
        for (let i = 0, n = points.length; i < n; i += 2) {
          const x = points[i], y = points[i + 1];
          context.moveTo(x + 1.5, y);
          context.arc(x, y, 1.5, 0, 2 * Math.PI);
        }
        context.fillStyle = "#000";
        context.fill();
      };

      worker.postMessage({ data, width, height, n });
    }

    init();

    return () => {
      if (worker) worker.terminate();
    };
  }, [imageSrc, width]);

  return <canvas ref={canvasRef} />;
}
