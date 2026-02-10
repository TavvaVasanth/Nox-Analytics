import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import Legend from "./legend";

function LegendWrapper({ color, title, ...options }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(Legend(color, { title, ...options }));
    }
  }, [color, title, options]);
  return <div style={{ marginBottom: "2rem" }} ref={ref} />;
}

export default function ColorLegend() {
  const data = Array.from({ length: 100 }, () => Math.random());

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      {/* Continuous / Sequential */}
      <LegendWrapper color={d3.scaleSequential(d3.interpolateBlues).domain([0, 100])} title="Sequential Blues" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1])} title="Diverging RdBu" />
      <LegendWrapper color={d3.scaleQuantize([0, 1], d3.schemeGreens[9])} title="Quantize Greens" />
      <LegendWrapper color={d3.scaleQuantile(data, d3.schemePurples[7])} title="Quantile Purples" />
      <LegendWrapper color={d3.scaleThreshold().domain([0.2, 0.4, 0.6, 0.8]).range(d3.schemeOranges[5])} title="Threshold Oranges" />

      {/* Ordinal palettes — must wrap in scaleOrdinal */}
    
      {/* More sequential palettes */}
      <LegendWrapper color={d3.scaleSequential(d3.interpolateViridis).domain([0, 10])} title="Viridis Scale" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolatePlasma).domain([0, 1])} title="Custom Tick Format" tickFormat=".0%" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolateRainbow).domain([0, 1])} title="Rainbow Scale" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolateWarm).domain([0, 50])} title="Warm Colors" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolateCool).domain([0, 50])} title="Cool Colors" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolateMagma).domain([0, 100])} title="Magma Scale" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolateCividis).domain([0, 100])} title="Cividis Scale" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0, 100])} title="Cubehelix Default" />
      <LegendWrapper color={d3.scaleSequential(d3.interpolateTurbo).domain([0, 1])} title="Turbo Scale" />
    </div>
  );
}
