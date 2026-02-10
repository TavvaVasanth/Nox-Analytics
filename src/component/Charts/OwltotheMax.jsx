import React, { useEffect, useRef } from "react";
import TinyQueue from "tinyqueue";
import * as d3 from "d3";

const WIDTH = 1024;
const AREA_POWER = 0.25;

class Quad {
  constructor(x, y, w, h, imageContext) {
    const [r, g, b, error] = colorFromHistogram(
      computeHistogram(imageContext, x, y, w, h)
    );
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = `#${(0x1000000 + (r << 16) + (g << 8) + b)
      .toString(16)
      .substring(1)}`;
    this.score = error * Math.pow(w * h, AREA_POWER);
  }

  split(imageContext) {
    const dx = this.w / 2,
      x1 = this.x,
      x2 = this.x + dx;
    const dy = this.h / 2,
      y1 = this.y,
      y2 = this.y + dy;
    return [
      new Quad(x1, y1, dx, dy, imageContext),
      new Quad(x2, y1, dx, dy, imageContext),
      new Quad(x1, y2, dx, dy, imageContext),
      new Quad(x2, y2, dx, dy, imageContext),
    ];
  }
}

function computeHistogram(imageContext, x, y, w, h) {
  const { data } = imageContext.getImageData(x, y, w, h);
  const histogram = new Uint32Array(1024);
  for (let i = 0, n = data.length; i < n; i += 4) {
    ++histogram[0 * 256 + data[i + 0]];
    ++histogram[1 * 256 + data[i + 1]];
    ++histogram[2 * 256 + data[i + 2]];
    ++histogram[3 * 256 + data[i + 3]];
  }
  return histogram;
}

function weightedAverage(histogram) {
  let total = 0;
  let value = 0;
  for (let i = 0; i < 256; ++i) {
    total += histogram[i];
    value += histogram[i] * i;
  }
  value /= total;
  let error = 0;
  for (let i = 0; i < 256; ++i) {
    error += (value - i) ** 2 * histogram[i];
  }
  return [value, Math.sqrt(error / total)];
}

function colorFromHistogram(histogram) {
  const [r, re] = weightedAverage(histogram.subarray(0, 256));
  const [g, ge] = weightedAverage(histogram.subarray(256, 512));
  const [b, be] = weightedAverage(histogram.subarray(512, 768));
  return [
    Math.round(r),
    Math.round(g),
    Math.round(b),
    re * 0.2989 + ge * 0.5870 + be * 0.1140,
  ];
}

export default function OwltotheMax({ imageSrc }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      context.drawImage(image, 0, 0, WIDTH, WIDTH);

      const quads = new TinyQueue(
        [new Quad(0, 0, WIDTH, WIDTH, context)],
        (a, b) => b.score - a.score
      );

      function step() {
        const q = quads.pop();
        if (!q || q.score < 50) return;

        const qs = q.split(context);
        const qsi = d3.interpolate([q, q, q, q], qs);
        qs.forEach((quad) => quads.push(quad));

        const m = Math.max(1, Math.floor(q.w / 10));
        for (let j = 1; j <= m; ++j) {
          const t = d3.easeCubicInOut(j / m);
          context.clearRect(q.x, q.y, q.w, q.h);
          for (const s of qsi(t)) {
            context.fillStyle = s.color;
            context.beginPath();
            context.moveTo(s.x + s.w, s.y + s.h / 2);
            context.arc(
              s.x + s.w / 2,
              s.y + s.h / 2,
              s.w / 2,
              0,
              2 * Math.PI
            );
            context.fill();
          }
        }
        requestAnimationFrame(step);
      }

      step();
    };
  }, [imageSrc]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={WIDTH}
      style={{ width: "100%" }}
    />
  );
}
