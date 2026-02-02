import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function StateChoropleth(){
    const ref=useRef()
    const [unemployment,setData]=useState([])
    const [us, setUS] = useState(null);
    useEffect(() => {
          d3.csv("/unemployment201907.csv", d => ({
            name:d.name,
            rate:d.rate,
            rank:d.rank
          })).then(setData);
      
          fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json")
            .then(res => res.json())
            .then(setUS);
        }, []);
    useEffect(()=>{
        if (!us || unemployment.length === 0) return;
        
            const svg = d3.select(ref.current);
            svg.selectAll("*").remove();
        
            const width = 975;
            const height = 610;
        
            svg
              .attr("width", width)
              .attr("height", height)
              .attr("viewBox", [0, 0, width, height])
              .style("max-width", "100%")
              .style("height", "auto");
        
            const counties = topojson.feature(us, us.objects.counties);
            const states = topojson.feature(us, us.objects.states);
            const stateMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
            const namemap = new Map(us.objects.states.geometries.map(d => [d.properties.name, d.id]))
            const valuemap = new Map(unemployment.map(d => [namemap.get(d.name), d.rate]));
        
            const projection = d3
              .geoAlbersUsa()
              .fitSize([width, height], states);
        
            const path = d3.geoPath(projection);
        
            const color = d3
              .scaleQuantize()
              .domain([1, 10])
              .range(d3.schemeOranges[9]);
        svg.append("g")
      .attr("transform", "translate(620,20)")
      .append(() =>
        Legend({
          color,
          title: "Unemployment rate (%)",
          width: 260
        })
      );
      svg.append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .join("path")
      .attr("fill", d => color(valuemap.get(d.id)))
      .attr("d", path)
    .append("title")
      .text(d => `${d.properties.name}\n${valuemap.get(d.id)}%`);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);
    },[unemployment ,us])
return <svg ref={ref}></svg>;
}





function Legend({ color, title, width = 260 }) {
  const scale = d3.scaleLinear()
    .domain(color.domain())
    .range([0, width]);

  const axis = d3.axisBottom(scale)
    .ticks(width / 80)
    .tickSize(-13);

  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", 44)
    .attr("viewBox", [0, 0, width, 44])
    .style("font", "10px sans-serif");

  svg.append("g")
    .selectAll("rect")
    .data(color.range().map(c => color.invertExtent(c)))
    .join("rect")
    .attr("x", d => scale(d[0]))
    .attr("width", d => scale(d[1]) - scale(d[0]))
    .attr("height", 13)
    .attr("fill", d => color(d[0]));

  svg.append("g")
    .attr("transform", "translate(0,13)")
    .call(axis)
    .call(g => g.select(".domain").remove())
    .call(g =>
      g.append("text")
        .attr("x", width / 2)
        .attr("y", -6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text(title)
    );

  return svg.node();
}
