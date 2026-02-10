import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Solver } from "odex";

const PredatorPreyCharts = ({
  alpha = 1,
  beta = 0.5,
  gamma = 0.5,
  delta = 0.1,
  x0 = 2,
  y0 = 1,
  width = 640,
  mode = "timeline"
}) => {
  const svgRef = useRef(null);

  const simulate = () => {
    const T = [];
    const X = [];
    const Y = [];

    // ✅ ODE function (f)
    const f = (t, y) => [
      alpha * y[0] - beta * y[0] * y[1],
      delta * y[0] * y[1] - gamma * y[1]
    ];

    // ✅ CORRECT solver construction
    const solver = new Solver(f, 2, { denseOutput: true });

    // ✅ grid helper (built-in)
    const grid = solver.grid(0.05, (t, y) => {
      T.push(t);
      X.push(y[0]);
      Y.push(y[1]);
    });

    // ✅ y0 MUST be normal JS array
    const yInitial = [Number(x0), Number(y0)];

    // ✅ CORRECT solve call
    solver.solve(0, yInitial, 24, grid);

    return { T, X, Y };
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { T, X, Y } = simulate();

    const height = 420;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleLinear()
      .domain([0, 24])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max([...X, ...Y]) * 1.2])
      .range([height - margin.bottom, margin.top]);

    svg.attr("viewBox", [0, 0, width, height]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.append("path")
      .datum(T)
      .attr("fill", "none")
      .attr("stroke", "#1f77b4")
      .attr("stroke-width", 2)
      .attr("d", d3.line().x(x).y((_, i) => y(X[i])));

    svg.append("path")
      .datum(T)
      .attr("fill", "none")
      .attr("stroke", "#d62728")
      .attr("stroke-width", 2)
      .attr("d", d3.line().x(x).y((_, i) => y(Y[i])));
  }, [alpha, beta, gamma, delta, x0, y0, width]);

  return <svg ref={svgRef} width={width} height={420} />;
};

export default PredatorPreyCharts;
