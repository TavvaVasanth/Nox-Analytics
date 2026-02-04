import { useEffect, useState } from "react";
import * as d3 from "d3";
import { fromArrayBuffer } from "geotiff";

export default function GeoTiff() {
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    async function loadTiff() {
      const response = await fetch("/sfctmp.tiff");
      const buffer = await response.arrayBuffer();
      const tiff = await fromArrayBuffer(buffer);
      const image = await tiff.getImage();

      const n = image.getWidth();
      const m = image.getHeight();

      function rotate(values) {
        const l = n >> 1;
        for (let j = 0, k = 0; j < m; ++j, k += n) {
          values.subarray(k, k + l).reverse();
          values.subarray(k + l, k + n).reverse();
          values.subarray(k, k + n).reverse();
        }
        return values;
      }

      let values = await image.readRasters();
      values = rotate(values[0]);

      const projection = d3.geoNaturalEarth1().precision(0.1);
      const path = d3.geoPath(projection);

      const contours = d3.contours().size([n, m]);
      const color = d3.scaleSequential(d3.extent(values), d3.interpolateMagma);

      function invert(d) {
        let p = {
          type: "Polygon",
          coordinates: d3.merge(
            d.coordinates.map(polygon =>
              polygon.map(ring =>
                ring.map(point => [
                  (point[0] / n) * 360 - 180,
                  90 - (point[1] / m) * 180
                ]).reverse()
              )
            )
          )
        };
        return p;
      }

      const svgPaths = Array.from(contours(values), d => ({
        d: path(invert(d)),
        fill: color(d.value)
      }));

      setPaths(svgPaths);
    }

    loadTiff();
  }, []);

  return (
    <svg viewBox="0 0 960 500" style={{ width: "100%", height: "auto", display: "block" }}>
      <g stroke="#000" strokeWidth={0.5} strokeLinejoin="round" strokeLinecap="round">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill} />
        ))}
      </g>
    </svg>
  );
}
