import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function WorldChoropleth(){
    const ref=useRef()
    const [world,setWorld]=useState(null)
    const [hale,setData]=useState([])
    useEffect(() => {
              d3.csv("/hale.csv", d => ({
                country:d.country,
                hale:+d.hale
              })).then(setData);
          
              fetch("/countries-50m.json")
                .then(res => res.json())
                .then(setWorld);
                }, []);


    useEffect(() => {
  if (!world || hale.length === 0) return;

  const svg = d3.select(ref.current);
  svg.selectAll("*").remove();

  const width = 928;
  const marginTop = 46;
  const height = width / 2 + marginTop;
  

  const countries = topojson.feature(world, world.objects.countries)
  const countrymesh = topojson.mesh(world, world.objects.countries, (a, b) => a !== b)


  const projection = d3.geoEqualEarth()
    .fitExtent([[2, marginTop + 2], [width - 2, height]], { type: "Sphere" });

  const path = d3.geoPath(projection);

  // --- FIX 1: correct value map ---

  const valuemap = new Map(
  hale.map(d => [d.country, d.hale])
);

  const color = d3.scaleSequential()
  .domain(d3.extent(valuemap.values()))
  .interpolator(d3.interpolateYlGnBu);

  // --- FIX 2: countries + mesh ---
  
  // --- FIX 3: color scale ---
  
  svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("max-width", "100%")
    .style("height", "auto");

  // Legend
  svg.append("g")
      .attr("transform", "translate(20,0)")
      .append(() => Legend(color, {title: "Healthy life expectancy (years)", width: 260}));


  // Globe background
  svg.append("path")
    .datum({type: "Sphere"})
    .attr("fill", "white")
    .attr("stroke", "currentColor")
    .attr("d", path);

    
  // Countries
  svg.append("g")
    .selectAll("path")
    .data(countries.features)
    .join("path")
      .attr("fill", d => {
  const v = valuemap.get(d.properties.name);
  return v == null ? "#ddd" : color(v);
})
      .attr("d", path)
    .append("title")
      .text(d => `${d.properties.name}\n${valuemap.get(d.properties.name)}`);

  // Borders
  svg.append("path")
    .datum(countrymesh)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("d", path);

}, [world, hale]);

    return <svg ref={ref}></svg>
}


function Legend(color, {
  title,
  tickSize = 6,
  width = 320, 
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {

  function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds
        = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? d3.format(tickFormat)
        : tickFormat;

    x = d3.scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3.scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

    tickAdjust = () => {};
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title));

  return svg.node();
}


