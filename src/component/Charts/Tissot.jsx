import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import * as d3p from "d3-geo-projection";

export default function Tossit() {
  const canvasRef = useRef(null);
  const prevParamsRef = useRef(null);

  const [world, setWorld] = useState(null);
  const [projectionName, setProjectionName] = useState("Aitoff");

  const projections = [
    { name: "Airy’s minimum error", value: d3p.geoAiry },
    { name: "Aitoff", value: d3p.geoAitoff },
    { name: "American polyconic", value: d3p.geoPolyconic },
    { name: "armadillo", value: d3p.geoArmadillo },
    { name: "August", value: d3p.geoAugust },
    { name: "Baker dinomic", value: d3p.geoBaker },
    { name: "Berghaus’ star", value: d3p.geoBerghaus },
    { name: "Bertin’s 1953", value: d3p.geoBertin1953 },
    { name: "Boggs’ eumorphic", value: d3p.geoBoggs },
    { name: "Boggs’ eumorphic (interrupted)", value: d3p.geoInterruptedBoggs },
    { name: "Bonne", value: d3p.geoBonne },
    { name: "Bottomley", value: d3p.geoBottomley },
    { name: "Bromley", value: d3p.geoBromley },
    { name: "Butterfly (gnomonic)", value: d3p.geoPolyhedralButterfly },
    { name: "Butterfly (Collignon)", value: d3p.geoPolyhedralCollignon },
    { name: "Butterfly (Waterman)", value: d3p.geoPolyhedralWaterman },
    { name: "Collignon", value: d3p.geoCollignon },
    { name: "Craig retroazimuthal", value: d3p.geoCraig },
    { name: "Craster parabolic", value: d3p.geoCraster },
    { name: "cylindrical equal-area", value: d3p.geoCylindricalEqualArea },
    { name: "cylindrical stereographic", value: d3p.geoCylindricalStereographic },
    { name: "Eckert I", value: d3p.geoEckert1 },
    { name: "Eckert II", value: d3p.geoEckert2 },
    { name: "Eckert III", value: d3p.geoEckert3 },
    { name: "Eckert IV", value: d3p.geoEckert4 },
    { name: "Eckert V", value: d3p.geoEckert5 },
    { name: "Eckert VI", value: d3p.geoEckert6 },
    { name: "Eisenlohr conformal", value: d3p.geoEisenlohr },
    { name: "Fahey pseudocylindrical", value: d3p.geoFahey },
    { name: "flat-polar parabolic", value: d3p.geoMtFlatPolarParabolic },
    { name: "flat-polar quartic", value: d3p.geoMtFlatPolarQuartic },
    { name: "flat-polar sinusoidal", value: d3p.geoMtFlatPolarSinusoidal },
    { name: "Foucaut’s stereographic equivalent", value: d3p.geoFoucaut },
    { name: "Foucaut’s sinusoidal", value: d3p.geoFoucautSinusoidal },
    { name: "general perspective", value: d3p.geoSatellite },
    { name: "Gilbert’s two-world", value: d3p.geoGilbert },
    { name: "Gingery", value: d3p.geoGingery },
    { name: "Ginzburg V", value: d3p.geoGinzburg5 },
    { name: "Ginzburg VI", value: d3p.geoGinzburg6 },
    { name: "Ginzburg VIII", value: d3p.geoGinzburg8 },
    { name: "Ginzburg IX", value: d3p.geoGinzburg9 },
    { name: "Goode’s homolosine", value: d3p.geoHomolosine },
    { name: "Goode’s homolosine (interrupted)", value: d3p.geoInterruptedHomolosine },

    { name: "Gringorten square", value: d3p.geoGringorten },
    { name: "Gringorten quincuncial", value: d3p.geoGringortenQuincuncial },
    { name: "Guyou square", value: d3p.geoGuyou },
    { name: "Hammer", value: d3p.geoHammer },
    { name: "Hammer retroazimuthal", value: d3p.geoHammerRetroazimuthal },
    { name: "HEALPix", value: d3p.geoHealpix },
    { name: "Hill eucyclic", value: d3p.geoHill },
    { name: "Hufnagel pseudocylindrical", value: d3p.geoHufnagel },
    { name: "Kavrayskiy VII", value: d3p.geoKavrayskiy7 },
    { name: "Lagrange conformal", value: d3p.geoLagrange },
    { name: "Larrivée", value: d3p.geoLarrivee },
    { name: "Laskowski tri-optimal", value: d3p.geoLaskowski },
    { name: "Loximuthal", value: d3p.geoLoximuthal },
    { name: "Miller cylindrical", value: d3p.geoMiller },
    { name: "Mollweide", value: d3p.geoMollweide },
    { name: "Mollweide (Goode’s interrupted)", value: d3p.geoInterruptedMollweide },
    { name: "Mollweide (interrupted hemispheres)", value: d3p.geoInterruptedMollweideHemispheres },

    { name: "Natural Earth II", value: d3p.geoNaturalEarth2 },
    { name: "Nell–Hammer", value: d3p.geoNellHammer },
    { name: "Nicolosi globular", value: d3p.geoNicolosi },
    { name: "Patterson cylindrical", value: d3p.geoPatterson },
    { name: "Peirce quincuncial", value: d3p.geoPeirceQuincuncial },
    { name: "rectangular polyconic", value: d3p.geoRectangularPolyconic },
    { name: "Robinson", value: d3p.geoRobinson },
    { name: "sinusoidal", value: d3p.geoSinusoidal },
    { name: "sinusoidal (interrupted)", value: d3p.geoInterruptedSinusoidal },
    { name: "sinu-Mollweide", value: d3p.geoSinuMollweide },
    { name: "sinu-Mollweide (interrupted)", value: d3p.geoInterruptedSinuMollweide },
   
    { name: "Times", value: d3p.geoTimes },
    { name: "Tobler hyperelliptical", value: d3p.geoHyperelliptical },
    { name: "Van der Grinten", value: d3p.geoVanDerGrinten },
    { name: "Van der Grinten II", value: d3p.geoVanDerGrinten2 },
    { name: "Van der Grinten III", value: d3p.geoVanDerGrinten3 },
    { name: "Van der Grinten IV", value: d3p.geoVanDerGrinten4 },
    { name: "Wagner IV", value: d3p.geoWagner4 },
    { name: "Wagner VI", value: d3p.geoWagner6 },
    { name: "Wagner VII", value: d3p.geoWagner7 },
    { name: "Werner", value: () => d3p.geoBonne().parallel(90) },
    { name: "Wiechel", value: d3p.geoWiechel },
    { name: "Winkel tripel", value: d3p.geoWinkel3 }
  ];  
  // Load world
  useEffect(() => {
    fetch("/land-50m.json")
      .then(r => r.json())
      .then(setWorld);
  }, []);

useEffect(() => {
  if (!world) return;

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const width = 954;
  const outline = { type: "Sphere" };
  const land = topojson.feature(world, world.objects.land);
  const graticule = d3.geoGraticule10();

  const projectionFactory = projections.find(p => p.name === projectionName)?.value;
  const projection = projectionFactory().fitWidth(width, outline);
  const path = d3.geoPath(projection, ctx);

  const [[, y0], [, y1]] = path.bounds(outline);
  const height = Math.ceil(y1 - y0);

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  // Ocean
  ctx.beginPath();
  path(outline);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Graticule
  ctx.beginPath();
  path(graticule);
  ctx.strokeStyle = "#ccc";
  ctx.stroke();

  // Land
  ctx.beginPath();
  path(land);
  ctx.fillStyle = "#000";
  ctx.fill();

  // Outline
  ctx.beginPath();
  path(outline);
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // Circles (Tissot’s indicatrices)
  const step = 10;
  const circle = d3.geoCircle().radius(step / 4).precision(10);
  const coordinates = [];
  for (let y = -80; y <= 80; y += step) {
    for (let x = -180; x < 180; x += step) {
      coordinates.push(circle.center([x, y])().coordinates);
    }
  }
  const circles = { type: "MultiPolygon", coordinates };

  ctx.beginPath();
  path(circles);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.stroke();
}, [world, projectionName]);

  return (
    <>
      <p>Projection</p>
      <select
        value={projectionName}
        onChange={e => setProjectionName(e.target.value)}
        style={{ marginBottom: "10px" }}
      >
        {projections.map(p => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
        <div className="mt-5"></div>
      <canvas ref={canvasRef} />
    </>
  );
}

