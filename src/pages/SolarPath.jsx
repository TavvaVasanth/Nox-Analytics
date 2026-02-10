// SolarPath.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  noon,
  rise,
  set,
  declination,
  apparentLongitude,
  obliquityOfEcliptic,
  century
} from "solar-calculator";

// Wrap solar-calculator into a helper
function makeSolar(location) {
  const [lon, lat] = location.coords;

  return {
    noon: (date) => noon(date, lon),
    position: (date) => {
      // Declination
      const t = century(date);
      const dec = declination(t);

      // Hour angle relative to local noon
      const minutes = (date.getUTCHours() * 60 + date.getUTCMinutes());
      const ha = (minutes / 4) - lon; // convert minutes to degrees, adjust longitude

      return [ha, dec];
    }
  };
}

// Scrubber with play/pause
function DateScrubber({ onDateChange }) {
  const days = d3.utcDays(
    new Date(Date.UTC(2019, 0, 1)),
    new Date(Date.UTC(2020, 0, 1))
  );
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  const currentDate = days[index];

  useEffect(() => {
    if (onDateChange) onDateChange(currentDate);
  }, [index]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % days.length);
      }, 200);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing]);

  return (
    <form style={{ display: "flex", alignItems: "center", marginBottom: "1em" }}>
      <button
        type="button"
        onClick={() => setPlaying(!playing)}
        style={{ marginRight: "0.4em", width: "5em" }}
      >
        {playing ? "Pause" : "Play"}
      </button>
      <input
        type="range"
        min={0}
        max={days.length - 1}
        value={index}
        onChange={(e) => setIndex(Number(e.target.value))}
        style={{ width: "180px" }}
      />
      <output style={{ marginLeft: "0.4em" }}>
        {currentDate.toLocaleString("en", {
          month: "long",
          day: "numeric",
          timeZone: "UTC"
        })}
      </output>
    </form>
  );
}

export default function SolarPath() {
  const svgRef = useRef(null);
  const [location, setLocation] = useState({
    coords: [-122.4194, 37.7749], // San Francisco default
    timeZone: "America/Los_Angeles"
  });
  const [date, setDate] = useState(new Date(Date.UTC(2019, 0, 1)));

  useEffect(() => {
    const solar = makeSolar(location);

   const dpr = window.devicePixelRatio || 1;

const width = 400 * dpr;
const height = 250 * dpr;
const cssWidth = 400;
const cssHeight = 250;

const projection = d3.geoStereographic()
  .reflectY(true)
  .scale((width - 120 * dpr) * 0.5)
  .clipExtent([[0, 0], [width, height]])
  .rotate([0, -90])
  .translate([width / 2, height / 2])
  .precision(0.01);

const path = d3.geoPath(projection);

const svg = d3.select(svgRef.current)
  .attr("viewBox", [0, 0, width, height])
  .attr("width", cssWidth)
  .attr("height", cssHeight)
  .style("width", "100%")
  .style("height", "auto")
  .style("shape-rendering", "geometricPrecision");

svg.selectAll("*").remove();


    // Graticule + outline
    const graticule = d3.geoGraticule().stepMinor([15, 10])();
    svg.append("path").attr("d", path(graticule)).attr("fill", "none").attr("stroke", "currentColor").attr("stroke-opacity", 0.2);
    const outline = d3.geoCircle().radius(90).center([0, 90])();
    svg.append("path").attr("d", path(outline)).attr("fill", "none").attr("stroke", "currentColor");

    // Sun path
    const start = d3.utcHour.offset(solar.noon(date), -12);
    const end = d3.utcHour.offset(start, 24);
    const coords = d3.utcMinutes(start, end).map(solar.position);

    svg.append("path")
      .attr("d", path({ type: "LineString", coordinates: coords }))
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2);

    // Hour markers
    const hourGroup = svg.append("g")
      .selectAll("g")
      .data(d3.utcHours(start, end))
      .join("g")
      .attr("transform", (d) => `translate(${projection(solar.position(d))})`);

    hourGroup.append("circle").attr("fill", "black").attr("r", 2);
    hourGroup.append("text").attr("dy", "-0.4em").attr("fill", "black")
      .text((d) => d.toLocaleString("en", { hour: "numeric", timeZone: location.timeZone }));

  }, [location, date]);

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { longitude, latitude } }) => {
        setLocation({
          coords: [longitude, latitude],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      },
      (err) => console.error("Geolocation error:", err)
    );
  };

  return (
    <div>
      <form style={{ display: "flex", alignItems: "center", marginBottom: "1em" }}>
        <button type="button" onClick={handleLocate} style={{ marginRight: "0.4em", width: "5em" }}>
          Locate!
        </button>
        <output>
          {`${Math.abs(location.coords[1]).toFixed(4)}°${location.coords[1] > 0 ? "N" : "S"}, ${Math.abs(location.coords[0]).toFixed(4)}°${location.coords[0] > 0 ? "E" : "W"}`}
        </output>
      </form>

      <DateScrubber onDateChange={(d) => setDate(d)} />

      <svg ref={svgRef}></svg>
    </div>
  );
}
