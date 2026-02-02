import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Sample subset of Gapminder-style data
const nations = [
  {
    name: "China",
    region: "Asia",
    values: [
      { year: 1800, income: 500, lifeExpectancy: 32, population: 350 },
      { year: 1900, income: 900, lifeExpectancy: 40, population: 400 },
      { year: 2000, income: 6000, lifeExpectancy: 72, population: 1300 }
    ]
  },
  {
    name: "India",
    region: "Asia",
    values: [
      { year: 1800, income: 600, lifeExpectancy: 30, population: 200 },
      { year: 1900, income: 800, lifeExpectancy: 42, population: 300 },
      { year: 2000, income: 5000, lifeExpectancy: 68, population: 1200 }
    ]
  },
  {
    name: "USA",
    region: "Americas",
    values: [
      { year: 1800, income: 1300, lifeExpectancy: 40, population: 5 },
      { year: 1900, income: 4000, lifeExpectancy: 60, population: 76 },
      { year: 2000, income: 32000, lifeExpectancy: 78, population: 300 }
    ]
  }
  // Add more nations if needed
];

const margin = { top: 20, right: 20, bottom: 40, left: 60 };
const width = 960;
const height = 600;

const WealthHealthChart = () => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    const x = d3.scaleLog()
      .domain([200, 100000])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([20, 85])
      .range([height - margin.bottom, margin.top]);

    const radius = d3.scaleSqrt()
      .domain([0, 1400])
      .range([0, 40]);

    const color = d3.scaleOrdinal()
      .domain(["Asia", "Europe", "Americas", "Africa"])
      .range(d3.schemeCategory10);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80, ","))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", width)
        .attr("y", -6)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text("Income per capita (USD) →"));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", 5)
        .attr("y", margin.top)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .text("↑ Life expectancy (years)"));

    // Initial draw
    const year = 1800;
    let currentYear = year;

    const dataAt = year => {
      return nations.map(nation => {
        const i = d3.bisector(d => d.year).left(nation.values, year, 0, nation.values.length - 1);
        const a = nation.values[i];
        const b = nation.values[i + 1];
        const t = b ? (year - a.year) / (b.year - a.year) : 0;
        const income = a.income + t * (b?.income - a.income || 0);
        const lifeExpectancy = a.lifeExpectancy + t * (b?.lifeExpectancy - a.lifeExpectancy || 0);
        const population = a.population + t * (b?.population - a.population || 0);
        return {
          name: nation.name,
          region: nation.region,
          income,
          lifeExpectancy,
          population
        };
      });
    };

    const g = svg.append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .attr("fill-opacity", 0.7);

    const circles = g.selectAll("circle")
      .data(dataAt(currentYear), d => d.name)
      .join("circle")
      .sort((a, b) => b.population - a.population)
      .attr("cx", d => x(d.income))
      .attr("cy", d => y(d.lifeExpectancy))
      .attr("r", d => radius(d.population))
      .attr("fill", d => color(d.region))
      .append("title")
      .text(d => `${d.name}\nRegion: ${d.region}`);

    // Add year label
    const yearLabel = svg.append("text")
      .attr("x", width - 100)
      .attr("y", height - 50)
      .attr("font-size", 48)
      .attr("fill", "#999")
      .attr("text-anchor", "end")
      .text(currentYear);

    function updateChart(year) {
      const interpolated = dataAt(year);
      g.selectAll("circle")
        .data(interpolated, d => d.name)
        .join("circle")
        .sort((a, b) => b.population - a.population)
        .attr("cx", d => x(d.income))
        .attr("cy", d => y(d.lifeExpectancy))
        .attr("r", d => d.population>0?radius(d.population):radius(0))
        .attr("fill", d => color(d.region))
        .select("title")
        .text(d => `${d.name}\nRegion: ${d.region}`);
      yearLabel.text(Math.floor(year));
    }

    // Animate from 1800 to 2000
    d3.timer(elapsed => {
      const year = 1800 + (elapsed / 10000) * (2000 - 1800);
      if (year <= 2000) {
        updateChart(year);
      }
    });

  }, []);

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Wealth & Health of Nations</h2>
      <svg ref={svgRef} width="100%" height="600px" />
    </div>
  );
};

export default WealthHealthChart;
