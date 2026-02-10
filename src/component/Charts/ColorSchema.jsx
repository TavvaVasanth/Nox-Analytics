// ColorSchema.jsx
import React, { useState } from "react";
import * as d3 from "d3";

// Discrete categorical palettes
const schemes = [
  "Category10",
  "Accent",
  "Dark2",
  "Paired",
  "Pastel1",
  "Pastel2",
  "Set1",
  "Set2",
  "Set3",
  "Tableau10"
];

// Continuous palettes
const ramps = [
  "Blues",
  "Greens",
  "Oranges",
  "Purples",
  "Reds",
  "Viridis",
  "Inferno",
  "Magma",
  "Plasma"
];

const Swatches = ({ name }) => {
  const colors = d3[`scheme${name}`];
  if (!colors) return null;
  const n = colors.length;
  const dark = d3.lab(colors[0]).l < 50;

  const [hoverColor, setHoverColor] = useState(null);

  return (
    <div style={{ position: "relative", marginBottom: "40px" }}>
      <svg
        viewBox={`0 0 ${n} 1`}
        style={{
          display: "block",
          width: `${n * 33}px`,
          height: "33px",
          margin: "0 -14px",
          cursor: "pointer"
        }}
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(colors));
          alert(`Copied ${name} colors!`);
        }}
      >
        {colors.map((c, i) => (
          <rect
            key={i}
            x={i}
            width={1}
            height={1}
            fill={c}
            onMouseEnter={() => setHoverColor(c)}
            onMouseLeave={() => setHoverColor(null)}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: "4px",
          color: dark ? "#fff" : "#000"
        }}
      >
        {hoverColor ? hoverColor : name}
      </div>
    </div>
  );
};

const Ramp = ({ name, n = 50 }) => {
  let colors;
  let dark;

  if (d3[`scheme${name}`] && d3[`scheme${name}`][n]) {
    colors = d3[`scheme${name}`][n];
    dark = d3.lab(colors[0]).l < 50;
  } else {
    const interpolate = d3[`interpolate${name}`];
    if (!interpolate) return null;
    colors = [];
    dark = d3.lab(interpolate(0)).l < 50;
    for (let i = 0; i < n; ++i) {
      colors.push(d3.rgb(interpolate(i / (n - 1))).hex());
    }
  }

  const [hoverColor, setHoverColor] = useState(null);

  return (
    <div style={{ position: "relative", marginBottom: "40px" }}>
      <svg
        viewBox={`0 0 ${n} 1`}
        style={{
          display: "block",
          shapeRendering: "crispEdges",
          width: "calc(100% + 28px)",
          height: "33px",
          margin: "0 -14px",
          cursor: "pointer"
        }}
        preserveAspectRatio="none"
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(colors));
          alert(`Copied ${name} ramp!`);
        }}
      >
        {colors.map((c, i) => (
          <rect
            key={i}
            x={i}
            width={1}
            height={1}
            fill={c}
            onMouseEnter={() => setHoverColor(c)}
            onMouseLeave={() => setHoverColor(null)}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: "4px",
          color: dark ? "#fff" : "#000"
        }}
      >
        {hoverColor ? hoverColor : name}
      </div>
    </div>
  );
};

const ColorSchema = () => {
  return (
    <div>
      {/* Discrete categorical swatches */}
      {schemes.map((scheme, i) => (
        <Swatches key={i} name={scheme} />
      ))}

      {/* Continuous ramps */}
      {ramps.map((scheme, i) => (
        <Ramp key={i} name={scheme} n={50} />
      ))}
    </div>
  );
};

export default ColorSchema;
