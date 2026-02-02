import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function LineChart() {
  const ref = useRef();
// Mock Apple stock dataset (~150 rows)
const aapl = Array.from({ length: 360 }, (_, i) => {
  // Start from Jan 2, 2025 and increment days
  const date = new Date(2025, 0, 2 + i);
  // Generate synthetic closing price around 180–200 with some variation
  const close = 180 + Math.sin(23) * 5 + Math.random() * 157;
  return { Date: date, Close: +close.toFixed(2) };
});

  useEffect(() => {
    const width = 928;
    const height = 500;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    d3.select(ref.current).selectAll("*").remove();

    const x = d3.scaleUtc(d3.extent(aapl, d => d.Date), [marginLeft, width - marginRight]);
    const y = d3.scaleLinear([0, d3.max(aapl, d => d.Close)], [height - marginBottom, marginTop]);

    const line = d3.line()
      .x(d => x(d.Date))
      .y(d => y(d.Close));

    const svg = d3.select(ref.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
      .style("overflow", "visible")
      .on("pointerenter pointermove", pointermoved)
      .on("pointerleave", pointerleft)
      .on("touchstart", event => event.preventDefault());

    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Daily Close Apple price($)"));

    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line(aapl));

    // Tooltip container
    const tooltip = svg.append("g").style("display", "none");

    const path = tooltip.append("path")
      .attr("fill", "white")
      .attr("stroke", "black");

    const text = tooltip.append("text");

    const bisect = d3.bisector(d => d.Date).center;

    function pointermoved(event) {
      const i = bisect(aapl, x.invert(d3.pointer(event)[0]));
      const d = aapl[i];

      tooltip.style("display", null);
      tooltip.attr("transform", `translate(${x(d.Date)},${y(d.Close)})`);

      text.selectAll("tspan")
        .data([formatDate(d.Date), formatValue(d.Close)])
        .join("tspan")
        .attr("x", 0)
        .attr("y", (_, i) => `${i * 1.1}em`)
        .attr("font-weight", (_, i) => i ? null : "bold")
        .text(d => d);

      size(text, path);
    }

    function pointerleft() {
      tooltip.style("display", "none");
    }

    function size(text, path) {
      const { x, y, width: w, height: h } = text.node().getBBox();
      text.attr("transform", `translate(${-w / 2},${15 - y})`);
      path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    }

    function formatValue(value) {
      return value.toLocaleString("en", {
        style: "currency",
        currency: "USD"
      });
    }

    function formatDate(date) {
      return date.toLocaleString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
      });
    }
  }, []);

  return <svg ref={ref}></svg>;
}
