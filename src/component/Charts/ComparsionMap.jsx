import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const ComparisonMap = () => {
  const svgRef = useRef();
  const legendRef = useRef();

  useEffect(() => {
    const width = 780;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", "90 6 780 500")
      .style("overflow", "visible")
      .style("width", "100%")
      .style("height", "auto")
      .style("transform", "translate3d(0,0,0)");

    Promise.all([
      d3.json("https://gist.githubusercontent.com/mbostock/df1b792d76fcb748056ff94b912e4bb8/raw/b1da4894cfb1e56a24129c27b39aa957d7f0c165/topology.json"),
      d3.json("https://gist.githubusercontent.com/mbostock/df1b792d76fcb748056ff94b912e4bb8/raw/b1da4894cfb1e56a24129c27b39aa957d7f0c165/names.json"),
      d3.json("https://gist.githubusercontent.com/mbostock/df1b792d76fcb748056ff94b912e4bb8/raw/b1da4894cfb1e56a24129c27b39aa957d7f0c165/deaths.json")
    ]).then(([topology, namesJson, deathsJson]) => {
      const counties = topojson.feature(topology.topology, topology.topology.objects.counties).features;
      const states = topojson.mesh(topology.topology, topology.topology.objects.states, (a, b) => a !== b);

      const names = new Map(namesJson.locations.flat.map(({ location_id, name }) => [location_id, name]));
      for (const { location_id, parent_id, level, name } of namesJson.locations.flat) {
        if (level === 2) {
          names.set(location_id, `${name}, ${names.get(parent_id)}`);
        }
      }

      const deaths = new Map(deathsJson.data.map(({ location_id, value }) => [location_id, value]));

      const values = [...deaths.values()];
      const max = Math.max(-d3.min(values, ([a, b]) => b - a), d3.max(values, ([a, b]) => b - a));

      const color2 = d3.scaleSqrt()
        .domain([-max, 0, max])
        .range([-1, 0, 1])
        .interpolate((a, b) =>
          a < 0 ? t => d3.interpolateBlues(1 - t) : t => d3.interpolateReds(t)
        );

      const path = d3.geoPath();

      svg.selectAll("path.county")
        .data(counties)
        .enter().append("path")
        .attr("class", "county")
        .attr("fill", d => color2(deaths.get(d.properties.location_id)[1] - deaths.get(d.properties.location_id)[0]))
        .attr("d", path)
        .on("mouseover", function () { d3.select(this).attr("stroke", "#000").raise(); })
        .on("mouseout", function () { d3.select(this).attr("stroke", null).lower(); })
        .append("title")
        .text(d => {
          const id = d.properties.location_id;
          const diff = deaths.get(id)[1] - deaths.get(id)[0];
          return `${names.get(id)}
${d3.format("+.1f")(diff)} deaths per 100,000 people
${d3.format(".1f")(deaths.get(id)[0])} per 100,000 in 1980
${d3.format(".1f")(deaths.get(id)[1])} per 100,000 in 2014`;
        });

      svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("d", path(states));

      // Render legend
      const legendSvg = d3.select(legendRef.current)
        .attr("width", 320)
        .attr("height", 60)
        .style("overflow", "visible");

      legendSvg.selectAll("*").remove();

      const ramp = (color, n = 256) => {
        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        for (let i = 0; i < n; ++i) {
          context.fillStyle = color(i / (n - 1));
          context.fillRect(i, 0, 1, 1);
        }
        return canvas;
      };

      const x = d3.scaleLinear()
        .domain(color2.domain())
        .range([0, 320]);

      legendSvg.append("image")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 320)
        .attr("height", 13)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color2.interpolator()).toDataURL());

      legendSvg.append("g")
        .attr("transform", "translate(0,33)")
        .call(d3.axisBottom(x)
          .ticks(5, "+d")
          .tickSize(6))
        .call(g => g.select(".domain").remove());

      legendSvg.append("text")
        .attr("x", 0)
        .attr("y", 12)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Change in deaths per 100,000 people");
    });
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>1980 – 2014 Death Comparison</h2>
      <svg ref={svgRef}></svg>
      <svg ref={legendRef}></svg>
    </div>
  );
};

export default ComparisonMap;
