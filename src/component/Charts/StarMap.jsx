import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function StarMap() {
  const ref = useRef();
  const [data, setData] = useState(null)
    const nominative = {And: "Andromeda", Ant: "Antlia", Aps: "Apus", Aqr: "Aquarius", Aql: "Aquila", Ara: "Ara", Ari: "Aries", Aur: "Auriga", Boo: "Boötes", Cae: "Caelum", Cam: "Camelopardalis", Cnc: "Cancer", CVn: "Canes Venatici", CMa: "Canis Major", CMi: "Canis Minor", Cap: "Capricornus", Car: "Carina", Cas: "Cassiopeia", Cen: "Centaurus", Cep: "Cepheus", Cet: "Cetus", Cha: "Chamaeleon", Cir: "Circinus", Col: "Columba", Com: "Coma Berenices", CrA: "Corona Austrina", CrB: "Corona Borealis", Crv: "Corvus", Crt: "Crater", Cru: "Crux", Cyg: "Cygnus", Del: "Delphinus", Dor: "Dorado", Dra: "Draco", Equ: "Equuleus", Eri: "Eridanus", For: "Fornax", Gem: "Gemini", Gru: "Grus", Her: "Hercules", Hor: "Horologium", Hya: "Hydra", Hyi: "Hydrus", Ind: "Indus", Lac: "Lacerta", Leo: "Leo", LMi: "Leo Minor", Lep: "Lepus", Lib: "Libra", Lup: "Lupus", Lyn: "Lynx", Lyr: "Lyra", Men: "Mensa", Mic: "Microscopium", Mon: "Monoceros", Mus: "Musca", Nor: "Norma", Oct: "Octans", Oph: "Ophiuchus", Ori: "Orion", Pav: "Pavo", Peg: "Pegasus", Per: "Perseus", Phe: "Phoenix", Pic: "Pictor", Psc: "Pisces", PsA: "Piscis Austrinus", Pup: "Puppis", Pyx: "Pyxis", Ret: "Reticulum", Sge: "Sagitta", Sgr: "Sagittarius", Sco: "Scorpius", Scl: "Sculptor", Sct: "Scutum", Ser: "Serpens", Sex: "Sextans", Tau: "Taurus", Tel: "Telescopium", Tri: "Triangulum", TrA: "Triangulum Australe", Tuc: "Tucana", UMa: "Ursa Major", UMi: "Ursa Minor", Vel: "Vela", Vir: "Virgo", Vol: "Volans", Vul: "Vulpecula"}
    const genitive = {And: "Andromedae", Ant: "Antliae", Aps: "Apodis", Aqr: "Aquarii", Aql: "Aquilae", Ara: "Arae", Ari: "Arietis", Aur: "Aurigae", Boo: "Boötis", Cae: "Caeli", Cam: "Camelopardalis", Cnc: "Cancri", CVn: "Canum Venaticorum", CMa: "Canis Majoris", CMi: "Canis Minoris", Cap: "Capricorni", Car: "Carinae", Cas: "Cassiopeiae", Cen: "Centauri", Cep: "Cephei", Cet: "Ceti", Cha: "Chamaeleontis", Cir: "Circini", Col: "Columbae", Com: "Comae Berenices", CrA: "Coronae Australis", CrB: "Coronae Borealis", Crv: "Corvi", Crt: "Crateris", Cru: "Crucis", Cyg: "Cygni", Del: "Delphini", Dor: "Doradus", Dra: "Draconis", Equ: "Equulei", Eri: "Eridani", For: "Fornacis", Gem: "Geminorum", Gru: "Gruis", Her: "Herculis", Hor: "Horologii", Hya: "Hydrae", Hyi: "Hydri", Ind: "Indi", Lac: "Lacertae", Leo: "Leonis", LMi: "Leonis Minoris", Lep: "Leporis", Lib: "Librae", Lup: "Lupi", Lyn: "Lyncis", Lyr: "Lyrae", Men: "Mensae", Mic: "Microscopii", Mon: "Monocerotis", Mus: "Muscae", Nor: "Normae", Oct: "Octantis", Oph: "Ophiuchi", Ori: "Orionis", Pav: "Pavonis", Peg: "Pegasi", Per: "Persei", Phe: "Phoenicis", Pic: "Pictoris", Psc: "Piscium", PsA: "Piscis Austrini", Pup: "Puppis", Pyx: "Pyxidis", Ret: "Reticuli", Sge: "Sagittae", Sgr: "Sagittarii", Sco: "Scorpii", Scl: "Sculptoris", Sct: "Scuti", Ser: "Serpentis", Sex: "Sextantis", Tau: "Tauri", Tel: "Telescopii", Tri: "Trianguli", TrA: "Trianguli Australis", Tuc: "Tucanae", UMa: "Ursae Majoris", UMi: "Ursae Minoris", Vel: "Velorum", Vir: "Virginis", Vol: "Volantis", Vul: "Vulpeculae"}
    const letters = {alf: "α", bet: "β", gam: "γ", del: "δ", eps: "ε", zet: "ζ", eta: "η", tet: "θ", iot: "ι", kap: "κ", lam: "λ", mu: "μ", nu: "ν", xi: "ξ", omi: "ο", pi: "π", ro: "ρ", sig: "σ", tau: "τ", ups: "υ", phi: "φ", chi: "χ", psi: "ψ", omg: "ω"}
  useEffect(() => {
    d3.csv("/stars.csv", d => {
      d3.autoType(d);
      const longitude = (d.RA_hour + d.RA_min / 60 + d.RA_sec / 3600) * 15;
      const latitude = d.dec_deg + d.dec_min / 60 + d.dec_sec / 3600;
      return {
        id: d.ID,
        greek: d.greek_letter,
        constellation: d.constellation,
        magnitude: d.magnitude,
        longitude,
        latitude
      };
    }).then(parsed => {
      parsed.sort((a, b) => d3.ascending(a.magnitude, b.magnitude));
      setData(parsed);
    });
  }, []);

  useEffect(() => {
    if (!data) return;

    const width = 982;
    const height = width;
    const cx = width / 2;
    const cy = height / 2;

    const radius = d3.scaleLinear()
      .domain([6, -1])
      .range([0, 8]);

    const outline = d3.geoCircle().radius(90).center([0, 90])();
    const graticule = d3.geoGraticule().stepMinor([15, 10])();

    const projection = d3.geoStereographic()
      .reflectY(true)
      .scale((width - 120) * 0.5)
      .clipExtent([[0, 0], [width, height]])
      .rotate([0, -90])
      .translate([cx, cy])
      .precision(0.1);

    const path = d3.geoPath(projection);

    const voronoi = d3.Delaunay
      .from(data.map(d => projection([d.longitude, d.latitude])))
      .voronoi([0, 0, width, height]);

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "display:block;margin:0 -14px;width:100%;height:auto;font:10px sans-serif;color:white;background:radial-gradient(#081f4b 0%, #061616 100%);")
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor");

    svg.append("path").attr("d", path(graticule)).attr("fill", "none").attr("stroke", "currentColor").attr("stroke-opacity", 0.2);
    svg.append("path").attr("d", path(outline)).attr("fill", "none").attr("stroke", "currentColor");

    // Stars
    svg.append("g")
      .attr("stroke", "black")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", d => radius(d.magnitude))
      .attr("transform", d => `translate(${projection([d.longitude, d.latitude])})`);

    // Voronoi hover
    const focusDeclination = svg.append("circle").attr("cx", cx).attr("cy", cy).attr("fill", "none").attr("stroke", "yellow");
    const focusRightAscension = svg.append("line").attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", cy).attr("stroke", "yellow");

    svg.append("g")
      .attr("pointer-events", "all")
      .attr("fill", "none")
      .selectAll("path")
      .data(data)
      .join("path")
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted)
      .attr("d", (d, i) => voronoi.renderCell(i))
      .append("title")
      .text(formatTitle);

    function mouseovered(event, d) {
      const [px, py] = projection([d.longitude, d.latitude]);
      const dx = px - cx;
      const dy = py - cy;
      const a = Math.atan2(dy, dx);
      focusDeclination.attr("r", Math.hypot(dx, dy));
      focusRightAscension.attr("x2", cx + 1e3 * Math.cos(a)).attr("y2", cy + 1e3 * Math.sin(a));
    }

    function mouseouted() {
      focusDeclination.attr("r", null);
      focusRightAscension.attr("x2", cx).attr("y2", cy);
    }

    function formatTitle({ id, constellation, greek }) {
      return `HR${id}${constellation == null ? `` :
        greek == null ? `\n${nominative[constellation]}` :
        `\n${greek.replace(/[a-z]+/g, w => letters[w])
                 .replace(/\d/g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c])} ${genitive[constellation]}`}`;
    }
  }, [data]);

  return <svg ref={ref}></svg>;
}