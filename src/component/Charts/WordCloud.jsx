// Wordcloud.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";

// Example stopwords (extend as needed)
const stopwords = new Set(
  "i,me,my,myself,we,our,you,your,he,she,it,they,them,the,a,an,and,or,but,is,are,was,were,be,been,being,to,of,in,that,this,with,for,on,as,by,at,from"
    .split(",")
);

function preprocessText(source) {
  return source
    .split(/[\s.]+/g)
    .map((w) => w.replace(/^[“‘"'`\-—()[\]{}]+/g, ""))
    .map((w) => w.replace(/[;:.!?()[\]{}"'’”`\-—]+$/g, ""))
    .map((w) => w.replace(/['’]s$/g, ""))
    .map((w) => w.substring(0, 30))
    .map((w) => w.toLowerCase())
    .filter((w) => w && !stopwords.has(w));
}

export default function Wordcloud({
  file = "/dream.txt",     // 👈 text file from public folder
  width = 640,
  height = 400,
  fontFamily = "sans-serif",
  fontScale = 15,
  padding = 1,
  rotate = () => (~~(Math.random() * 6) - 3) * 30,
  maxWords = 250,
}) {
  const ref = useRef();
  const [text, setText] = useState("");

  // 1️⃣ Fetch text file
  useEffect(() => {
    fetch(file)
      .then((res) => res.text())
      .then((data) => setText(data))
      .catch((err) => console.error("Error loading text file:", err));
  }, [file]);

  // 2️⃣ Build word cloud once text is loaded
  useEffect(() => {
    if (!text) return;

    const words = preprocessText(text);

    const data = d3
      .rollups(words, (group) => group.length, (w) => w)
      .sort(([, a], [, b]) => d3.descending(a, b))
      .slice(0, maxWords)
      .map(([key, size]) => ({ text: key, size }));

    const layout = cloud()
      .size([width, height])
      .words(data)
      .padding(padding)
      .rotate(rotate)
      .font(fontFamily)
      .fontSize((d) => Math.sqrt(d.size) * fontScale)
      .on("end", draw);

    layout.start();

    function draw(words) {
      const svg = d3
        .select(ref.current)
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("font-family", fontFamily)
        .attr("text-anchor", "middle");

      svg.selectAll("*").remove();

      const color = d3
        .scaleSequential()
        .domain(d3.extent(words, (d) => d.size))
        .interpolator(d3.interpolateCool);

      svg
        .selectAll("text")
        .data(words)
        .join("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("fill", (d) => color(d.size))
        .attr(
          "transform",
          (d) =>
            `translate(${width / 2 + d.x},${height / 2 + d.y}) rotate(${d.rotate})`
        )
        .text((d) => d.text);
    }
  }, [
    text,
    width,
    height,
    fontFamily,
    fontScale,
    padding,
    rotate,
    maxWords,
  ]);

  return <svg ref={ref} style={{ border: "1px solid #ccc" }} />;
}
