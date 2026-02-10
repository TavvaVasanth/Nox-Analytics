import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const palettes = {
  "Wes Anderson": ["#ff4848", "#00cdb1", "#ffc638", "#ffa641", "#a0d8e7"],
  Blues: ["#0c96da", "#be98ad", "#77d7e3", "#f4cdcd", "#01ccd9", "#f4e2c6"],
  "rag-taj": ["#73d5c1", "#e29ba0", "#ba1e6b", "#ffbe45"],
  "rag-mysore": ["#e8ac52", "#639aa0", "#ec6c26", "#613a53"],
  iiso_zeitung: ["#f3df76", "#00a9c0", "#f7ab76", "#ee8067"],
  "present-correct": ["#fe7646", "#ffbb51", "#7356ac", "#fe737a", "#a0ccbb"],
  verena: ["#936ead", "#3e78e1", "#f37265", "#f6bc25", "#16b069"],
  iiso_daily: ["#7f8cb6", "#f0d967", "#ef9640", "#1daeb1", "#e76c4a"]
};

export default function WaterColor() {
  const svgRef = useRef();
  const [palette, setPalette] = useState("Wes Anderson");
  const [drawMesh, setDrawMesh] = useState(true);
  const [seed, setSeed] = useState(0);
  const [usData, setUsData] = useState(null);

  // Load US TopoJSON
  useEffect(() => {
    fetch("https://unpkg.com/us-atlas@1.0.2/us/10m.json")
      .then(r => r.json())
      .then(setUsData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!usData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", 960).attr("height", 600);

    const defs = svg.append("defs");
    const path = d3.geoPath();

    /* 🎨 WATER COLOR FILTER (CLEAN) */
    defs.append("filter").attr("id", "splotch").html(`
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.015"
        numOctaves="2"
        seed="${seed}"
        result="noise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="6"
        xChannelSelector="R"
        yChannelSelector="G"
      />
      <feGaussianBlur stdDeviation="0.4" />
    `);

    /* ✏️ PENCIL FILTER */
    defs.append("filter").attr("id", "pencil").html(`
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.02"
        numOctaves="4"
      />
      <feDisplacementMap scale="2"/>
    `);

    const states = topojson.feature(
      usData,
      usData.objects.states
    ).features;

    const neighbors = topojson.neighbors(
      usData.objects.states.geometries
    );

    /* 🎯 SAFE COLOR ASSIGNMENT */
    const paletteColors = d3.shuffle([...palettes[palette]]);
    const assigned = new Array(states.length);

    states.forEach((d, i) => {
      const used = new Set(
        neighbors[i].map(n => assigned[n]).filter(Boolean)
      );

      const color =
        paletteColors.find(c => !used.has(c)) ||
        paletteColors[i % paletteColors.length];

      assigned[i] = color;
      d.properties.color = color;
    });

    /* DRAW STATES */
    svg
      .selectAll(".state")
      .data(states)
      .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", path)
      .attr("fill", d => d.properties.color)
      .attr("stroke", d => d.properties.color)
      .attr("stroke-width", 2)
      .attr("filter", "url(#splotch)");

    /* DRAW BORDERS */
    if (drawMesh) {
      const mesh = topojson.mesh(
        usData,
        usData.objects.states
      );

      svg
        .append("path")
        .attr("d", path(mesh))
        .attr("fill", "none")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.8)
        .attr("filter", "url(#pencil)");
    }
  }, [usData, palette, drawMesh, seed]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setSeed(s => s + 1)}>
          Randomize Colors
        </button>

        <select
          value={palette}
          onChange={e => setPalette(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          {Object.keys(palettes).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <label style={{ marginLeft: 12 }}>
          <input
            type="checkbox"
            checked={drawMesh}
            onChange={e => setDrawMesh(e.target.checked)}
          />
          Pencil Outlines
        </label>
      </div>

      <svg ref={svgRef} />
    </div>
  );
}
