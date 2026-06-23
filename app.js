/* app.js — UI for the WHEC-Water sandbox + course.
   Loads basins.geojson, drives the Leaflet map, runs WModel live on every
   control change, and renders the LESSONS course. Pure browser, no build. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const D = WModel.DEFAULTS;

  let BASINS = [];            // plain objects with props (+ feature for geometry)
  let GEO = null;             // GeoJSON FeatureCollection
  let map, layer;            // Leaflet
  let manualSel = new Set();  // pfaf_ids chosen in manual mode
  let state = {
    strategy: "distributed", target: D.targetMW, nNodes: D.nNodes,
    eKWh: D.eKWhPerKg, lPerKg: D.lPerKg, alloc: D.allocShare,
    month: D.monthIndex, desal: D.desalOn, desalPrem: D.desalPremium,
    elec: D.elecPrice, capex: D.capexPerKw, crf: D.crf, waterCost: D.waterCost,
    floor: 0, ceil: 5, layer: "nodes",
  };
  function freshState() {
    return { strategy: "distributed", target: D.targetMW, nNodes: D.nNodes,
      eKWh: D.eKWhPerKg, lPerKg: D.lPerKg, alloc: D.allocShare,
      month: D.monthIndex, desal: D.desalOn, desalPrem: D.desalPremium,
      elec: D.elecPrice, capex: D.capexPerKw, crf: D.crf, waterCost: D.waterCost,
      floor: 0, ceil: 5, layer: "nodes" };
  }

  // ---------- color helpers ----------
  function lerp(a, b, t) {
    const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const ca = p(a), cb = p(b);
    const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * Math.max(0, Math.min(1, t))));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }
  function ramp(t, stops) { // stops: [hex,...]; t in 0..1
    const n = stops.length - 1, x = Math.max(0, Math.min(1, t)) * n, i = Math.min(n - 1, Math.floor(x));
    return lerp(stops[i], stops[i + 1], x - i);
  }
  const RAMPS = {
    solar: ["#fff3cc", "#fdae61", "#d7301f"],
    stress: ["#eef6fb", "#74a9cf", "#08306b"],
    viability: ["#f2f7f2", "#74c476", "#00692a"],
    budget: ["#f0f6ff", "#6baed6", "#08519c"],
    burden: ["#2E8B57", "#E8A33D", "#C0392B"],
    lcoh: ["#2E8B57", "#E8A33D", "#C0392B"],   // cheap green -> expensive red
  };

  function params() {
    return {
      targetMW: state.target, nNodes: state.nNodes, eKWhPerKg: state.eKWh,
      lPerKg: state.lPerKg, allocShare: state.alloc, monthIndex: state.month,
      desalOn: state.desal, desalPremium: state.desalPrem, elecPrice: state.elec,
      capexPerKw: state.capex, crf: state.crf, waterCost: state.waterCost,
      solarFloor: state.floor, stressCeiling: state.ceil,
    };
  }

  // ---------- map ----------
  function initMap() {
    map = L.map("map", { scrollWheelZoom: false, zoomControl: true }).setView([39.6, -8.1], 6);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap, © CARTO", subdomains: "abcd", maxZoom: 12,
    }).addTo(map);
  }

  function basinById(id) { return BASINS.find((b) => b.pfaf_id === id); }

  function styleFor(props, alloc, evalRows) {
    const lyr = state.layer;
    const p = params();
    let fill = "#cfd8df", t = 0;
    if (lyr === "solar") { t = (props.pvout - 1300) / (1620 - 1300); fill = ramp(t, RAMPS.solar); }
    else if (lyr === "stress") { t = WModel.stressNorm(props, p); fill = ramp(t, RAMPS.stress); }
    else if (lyr === "viability") { t = props.viability; fill = ramp(t, RAMPS.viability); }
    else if (lyr === "budget") { t = props.avail_Mm3_yr / 11000; fill = ramp(t, RAMPS.budget); }
    else if (lyr === "lcoh") { t = (WModel.lcoh(props, p) - 3) / (9 - 3); fill = ramp(t, RAMPS.lcoh); }
    else if (lyr === "nodes") {
      const r = evalRows.find((x) => x.b.pfaf_id === props.pfaf_id);
      if (r && r.mw > 0) fill = ramp(Math.min(1.2, r.burden) / 1.2, RAMPS.burden);
      else fill = "#e7ecef";
    }
    const selected = state.strategy === "manual" && manualSel.has(props.pfaf_id);
    return { fillColor: fill, fillOpacity: 0.82, color: selected ? "#0d2b3e" : "#7d8b96",
      weight: selected ? 3 : 0.8 };
  }

  function popupHtml(b, r) {
    const p = params();
    const mw = r ? r.mw : 0;
    const sNow = (WModel.stressNorm(b, p) * 5).toFixed(1);
    const seasonLbl = state.month >= 0 ? WModel.MONTHS[state.month] : "annual";
    return `<b>${b.province}</b> · basin ${b.pfaf_id}${b.coastal ? " · 🌊 coastal" : ""}<br>
      Solar PVOUT: <b>${b.pvout}</b> kWh/kWp/yr<br>
      Water stress (${seasonLbl}): <b>${sNow}</b>/5<br>
      LCOH: <b>€${WModel.lcoh(b, p).toFixed(2)}</b>/kg${WModel.usesDesal(b, p) ? " (desal)" : ""}<br>
      Water budget: <b>${b.avail_Mm3_yr}</b> Mm³/yr · Viability: <b>${b.viability.toFixed(2)}</b>
      ${mw > 0 ? `<hr style="margin:5px 0">Sited: <b>${Math.round(mw)} MW</b> · burden <b>${r.burden.toFixed(2)}</b>${r.desal ? " · seawater" : ""}` : ""}
      ${state.strategy === "manual" ? `<br><i>click to ${manualSel.has(b.pfaf_id) ? "remove" : "add"} node</i>` : ""}`;
  }

  // ---------- core recompute ----------
  function manualList() {
    const ids = [...manualSel];
    if (!ids.length) return [];
    const each = state.target / ids.length;
    return ids.map((id) => [id, each]);
  }

  function recompute() {
    const p = params();
    const res = WModel.run(BASINS, p, state.strategy, manualList());
    const alloc = WModel.allocate(BASINS, p, state.strategy, manualList());

    // verdict
    const pb = res.peakBurden;
    const fmtB = (x) => (x >= 100 ? "99+" : x.toFixed(2));
    $("peakB").textContent = res.nNodes ? fmtB(pb) : "—";
    const v = $("verdict");
    v.className = "verdict " + (pb > 1 ? "warn" : pb > 0.7 ? "mid" : "");
    $("verdictMsg").textContent = !res.nNodes ? "no eligible basins — relax the exclusions"
      : pb > 1 ? "OVER BUDGET — a basin is asked for more water than it can spare"
      : pb > 0.7 ? "tight — little headroom left" : "comfortable — every basin within its water headroom";

    // stats
    $("sLCOH").textContent = res.nNodes ? "€" + res.avgLCOH.toFixed(2) : "—";
    $("sH2").textContent = (res.totalH2 / 1e6).toFixed(1);
    $("sNodes").textContent = res.nNodes;
    $("sOver").textContent = res.basinsOver;

    // burden bars
    renderBurdens(res);

    // map
    if (layer) layer.remove();
    layer = L.geoJSON(GEO, {
      style: (f) => styleFor(f.properties, alloc, res.rows),
      onEachFeature: (f, lay) => {
        const b = basinById(f.properties.pfaf_id);
        const r = res.rows.find((x) => x.b.pfaf_id === b.pfaf_id);
        lay.bindPopup(popupHtml(b, r));
        lay.on("click", () => {
          if (state.strategy === "manual") {
            if (manualSel.has(b.pfaf_id)) manualSel.delete(b.pfaf_id);
            else manualSel.add(b.pfaf_id);
            recompute();
          }
        });
      },
    }).addTo(map);
    renderLegend();
  }

  function renderBurdens(res) {
    const active = res.rows.filter((r) => r.mw > 0).sort((a, b) => b.burden - a.burden);
    const host = $("burdens");
    if (!active.length) { host.innerHTML = `<p class="bnote">No nodes sited yet.</p>`; $("burdenNote").textContent = ""; return; }
    const scale = Math.max(1, ...active.map((r) => r.burden));
    host.innerHTML = active.map((r) => {
      const over = r.burden > 1;
      const w = (r.burden / scale) * 100;
      return `<div class="bbar">
        <span class="nm" title="${r.b.province}">${r.b.province}</span>
        <span class="track"><span class="fill ${over ? "over" : ""}" style="width:${w}%"></span>
          <span class="one" style="left:${(1 / scale) * 100}%"></span></span>
        <span class="val ${over ? "over" : ""}">${r.burden >= 100 ? "99+" : r.burden.toFixed(2)}</span>
      </div>`;
    }).join("");
    $("burdenNote").innerHTML = `Each node sized <b>${Math.round(active[0].mw)}–${Math.round(active[active.length - 1].mw)} MW</b>. ` +
      `The grey line marks burden = 1 (the basin's headroom). ` +
      (state.strategy === "single" ? "One plant concentrates all draw on a single basin." :
       state.strategy === "distributed" ? "Distributed mode equalises burdens (water-filling)." :
       "Manual: click basins on the map to add/remove nodes.");
  }

  function renderLegend() {
    const L_ = {
      solar: [["#fff3cc", "1300"], ["#fdae61", "1460"], ["#d7301f", "1620 kWh/kWp/yr"]],
      stress: [["#eef6fb", "low"], ["#74a9cf", "med"], ["#08306b", "extreme (bws 5)"]],
      viability: [["#f2f7f2", "0"], ["#74c476", "0.4"], ["#00692a", "0.85 best"]],
      budget: [["#f0f6ff", "low"], ["#6baed6", "mid"], ["#08519c", "high Mm³/yr"]],
      lcoh: [["#2E8B57", "€3 cheap"], ["#E8A33D", "€6"], ["#C0392B", "€9+/kg"]],
      nodes: [["#e7ecef", "no node"], ["#2E8B57", "burden 0"], ["#E8A33D", "≈1"], ["#C0392B", ">1 over"]],
    }[state.layer];
    $("legend").innerHTML = L_.map(([c, t]) => `<span><span class="sw" style="background:${c}"></span>${t}</span>`).join("");
  }

  // ---------- controls ----------
  function syncLabels() {
    $("targetVal").textContent = state.target + " MW";
    $("nNodesVal").textContent = state.nNodes;
    $("eVal").textContent = state.eKWh + " kWh/kg";
    $("lVal").textContent = state.lPerKg + " L/kg";
    $("allocVal").textContent = (state.alloc * 100).toFixed(1) + "%";
    $("monthVal").textContent = state.month >= 0 ? WModel.MONTHS[state.month] + " (real monthly stress)" : "Annual average";
    $("desalVal").textContent = "€" + state.desalPrem.toFixed(2) + "/kg";
    $("desal").checked = state.desal;
    $("elecVal").textContent = "€" + state.elec + "/MWh";
    $("capexVal").textContent = "€" + state.capex + "/kW";
    $("crfVal").textContent = Math.round(state.crf * 100) + "%/yr";
    $("waterCostVal").textContent = "€" + state.waterCost.toFixed(2) + "/m³";
    $("floorVal").textContent = state.floor <= 1300 ? "off" : state.floor + " kWh/kWp/yr";
    $("ceilVal").textContent = state.ceil.toFixed(1);
    $("nNodesWrap").style.opacity = state.strategy === "distributed" ? 1 : 0.4;
    $("strategyNote").textContent = {
      single: "All capacity on the single best-solar eligible basin — the naive choice.",
      distributed: "Optimiser spreads capacity to minimise the worst basin's burden.",
      manual: "Click basins on the map; the target splits equally among them.",
    }[state.strategy];
    [["segStrategy", state.strategy], ["segLayer", state.layer]].forEach(([id, val]) => {
      [...$(id).children].forEach((b) => b.classList.toggle("active", b.dataset.v === val));
    });
  }

  function bindControls() {
    const sl = (id, fn) => $(id).addEventListener("input", (e) => { fn(+e.target.value); syncLabels(); recompute(); });
    sl("target", (v) => state.target = v);
    sl("nNodes", (v) => state.nNodes = v);
    sl("eKWh", (v) => state.eKWh = v);
    sl("lPerKg", (v) => state.lPerKg = v);
    sl("alloc", (v) => state.alloc = v / 100);
    sl("month", (v) => state.month = v);
    sl("desalPrem", (v) => state.desalPrem = v);
    sl("elec", (v) => state.elec = v);
    sl("capex", (v) => state.capex = v);
    sl("crf", (v) => state.crf = v / 100);
    sl("waterCost", (v) => state.waterCost = v);
    sl("floor", (v) => state.floor = v);
    sl("ceil", (v) => state.ceil = v);
    $("desal").addEventListener("change", (e) => { state.desal = e.target.checked; syncLabels(); recompute(); });
    $("segStrategy").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      state.strategy = b.dataset.v; syncLabels(); recompute();
    });
    $("segLayer").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      state.layer = b.dataset.v; syncLabels(); recompute();
    });
    $("resetBtn").addEventListener("click", () => {
      state = freshState();
      manualSel.clear(); pushStateToInputs(); syncLabels(); recompute();
    });
  }

  function pushStateToInputs() {
    $("target").value = state.target; $("nNodes").value = state.nNodes;
    $("eKWh").value = state.eKWh; $("lPerKg").value = state.lPerKg;
    $("alloc").value = state.alloc * 100; $("month").value = state.month;
    $("desal").checked = state.desal; $("desalPrem").value = state.desalPrem;
    $("elec").value = state.elec; $("capex").value = state.capex;
    $("crf").value = state.crf * 100; $("waterCost").value = state.waterCost;
    $("floor").value = state.floor || 1300; $("ceil").value = state.ceil;
  }

  // ---------- export & share ----------
  function encodeState() {
    const q = new URLSearchParams({
      st: state.strategy, t: state.target, n: state.nNodes, e: state.eKWh,
      l: state.lPerKg, a: state.alloc, mo: state.month, ds: state.desal ? 1 : 0,
      dp: state.desalPrem, el: state.elec, cx: state.capex, cr: state.crf,
      wc: state.waterCost, f: state.floor, c: state.ceil, ly: state.layer,
    });
    if (manualSel.size) q.set("m", [...manualSel].join("."));
    return q.toString();
  }
  function applyHash() {
    const h = location.hash.replace(/^#/, "");
    if (!h) return;
    const q = new URLSearchParams(h);
    const num = (k, d) => (q.has(k) ? +q.get(k) : d);
    if (q.has("st")) state.strategy = q.get("st");
    state.target = num("t", state.target); state.nNodes = num("n", state.nNodes);
    state.eKWh = num("e", state.eKWh); state.lPerKg = num("l", state.lPerKg);
    state.alloc = num("a", state.alloc); state.month = num("mo", state.month);
    if (q.has("ds")) state.desal = q.get("ds") === "1";
    state.desalPrem = num("dp", state.desalPrem); state.elec = num("el", state.elec);
    state.capex = num("cx", state.capex); state.crf = num("cr", state.crf);
    state.waterCost = num("wc", state.waterCost);
    state.floor = num("f", state.floor); state.ceil = num("c", state.ceil);
    if (q.has("ly")) state.layer = q.get("ly");
    if (q.has("m")) q.get("m").split(".").forEach((id) => manualSel.add(+id));
  }
  function copyShare() {
    const url = location.origin + location.pathname + "#" + encodeState();
    const done = (ok) => { $("shareNote").textContent = ok
      ? "Link copied — it reopens this exact scenario." : "Copy failed; here it is: " + url; };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => done(true), () => done(false));
    else done(false);
  }
  function download(name, text, type) {
    const blob = new Blob([text], { type }); const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function exportCSV() {
    const p = params();
    const res = WModel.run(BASINS, p, state.strategy, manualList());
    const hdr = ["pfaf_id", "province", "coastal", "pvout_kWh_kWp_yr", "stress_used_0_5",
      "avail_Mm3_yr", "sited_MW", "water_m3_yr", "burden", "h2_kg_yr", "LCOH_eur_kg", "desal"];
    const sNorm = (r) => (WModel.stressNorm(r.b, p) * 5).toFixed(2);
    const rows = res.rows.filter((r) => r.mw > 0).sort((a, b) => b.burden - a.burden).map((r) =>
      [r.b.pfaf_id, `"${r.b.province}"`, r.b.coastal, r.b.pvout, sNorm(r), r.b.avail_Mm3_yr,
       Math.round(r.mw), Math.round(r.water), r.burden.toFixed(3), Math.round(r.h2),
       r.lcoh.toFixed(2), r.desal].join(","));
    const season = state.month >= 0 ? WModel.MONTHS[state.month] : "annual";
    const meta = [`# WHEC-Water Portugal screening — scenario export`,
      `# strategy=${state.strategy} target=${state.target}MW nodes=${state.nNodes} ` +
      `E=${state.eKWh}kWh/kg L=${state.lPerKg}L/kg share=${(state.alloc*100).toFixed(1)}% ` +
      `season=${season} desal=${state.desal} peakBurden=${res.peakBurden.toFixed(3)} ` +
      `avgLCOH=€${res.avgLCOH.toFixed(2)}/kg`,
      `# data: WRI Aqueduct 4.0 (annual+monthly) + PVGIS. Screening only, not permit-grade.`];
    download("whec_water_scenario.csv", meta.join("\n") + "\n" + hdr.join(",") + "\n" + rows.join("\n"),
      "text/csv");
  }

  // ---------- modes ----------
  function show(mode) {
    $("story").classList.toggle("hidden", mode !== "learn");
    $("sandbox").classList.toggle("hidden", mode !== "sandbox");
    $("about").classList.toggle("hidden", mode !== "about");
    [["mLearn", "learn"], ["mSandbox", "sandbox"], ["mAbout", "about"]].forEach(([id, m]) =>
      $(id).classList.toggle("active", m === mode));
    if (mode === "sandbox" && map) setTimeout(() => map.invalidateSize(), 60);
  }

  // ---------- course ----------
  let li = 0;
  let firstLesson = true;   // don't let lesson 1's `set` clobber a shared-link / default sandbox on boot
  function applyLessonSet(set) {
    if (!set) return;
    if (set.strategy) state.strategy = set.strategy;
    if (set.layer) state.layer = set.layer;
    if (set.targetMW != null) state.target = set.targetMW;
    if (set.nNodes != null) state.nNodes = set.nNodes;
    if (set.month != null) state.month = set.month;
    if (set.desal != null) state.desal = set.desal;
    pushStateToInputs(); syncLabels(); recompute();
  }
  function renderLesson() {
    const L_ = LESSONS[li];
    $("chapBadge").textContent = L_.ch;
    $("lessonCount").textContent = `Lesson ${li + 1} / ${LESSONS.length}`;
    $("progFill").style.width = ((li + 1) / LESSONS.length * 100) + "%";
    $("storyTitle").textContent = L_.title;
    $("storyBody").innerHTML = L_.body;
    $("prevBtn").disabled = li === 0;
    $("nextBtn").disabled = li === LESSONS.length - 1;
    renderCheck(L_.check);
    renderToc();
    if (firstLesson) firstLesson = false; else applyLessonSet(L_.set);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function renderCheck(c) {
    const host = $("lessonCheck");
    if (!c) { host.innerHTML = ""; return; }
    host.innerHTML = `<div class="check"><div class="q">${c.q}</div>
      ${c.opts.map((o, i) => `<button class="opt" data-i="${i}">${o.t}</button>`).join("")}
      <div class="reveal">${c.reveal}</div></div>`;
    host.querySelectorAll(".opt").forEach((btn) => btn.addEventListener("click", () => {
      const ok = c.opts[+btn.dataset.i].ok;
      btn.classList.add(ok ? "correct" : "wrong");
      if (ok) host.querySelectorAll(".opt").forEach((b) => b.disabled = true);
      host.querySelector(".reveal").classList.add("show");
    }));
  }
  function renderToc() {
    const chapters = [...new Set(LESSONS.map((l) => l.ch))];
    $("chapToc").innerHTML = chapters.map((ch) => {
      const first = LESSONS.findIndex((l) => l.ch === ch);
      const on = LESSONS[li].ch === ch;
      return `<button class="${on ? "on" : ""}" data-i="${first}">${ch.split(" · ")[0]}</button>`;
    }).join("");
    $("chapToc").querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => { li = +b.dataset.i; renderLesson(); }));
  }

  // ---------- about ----------
  function renderAbout() {
    $("about").innerHTML = `<div class="storycard">
      <h2 style="color:var(--navy)">What this is</h2>
      <p>An interactive reproduction and extension of the question behind <b>Adriana Alves'</b>
      WHEC 2026 talk (Abstract 776): <i>where can green hydrogen be built once water — not just
      sunlight — is treated as a first-order siting constraint?</i> Built on <b>100% public data</b>
      for mainland Portugal, it runs entirely in your browser.</p>
      <div class="defends">🛡️ <b>Screening tool, not permit-grade.</b> Water stress is basin-scale and
      modelled (Aqueduct); legal allocations aren't public; "project-scale" resolution lives below this layer.</div>
      <h2 style="color:var(--navy);margin-top:14px">The data</h2>
      <div class="litnote"><b>WRI Aqueduct 4.0</b> — hydrobasin geometry + baseline water stress (bws 0–5).
      <span class="src ext">EXT</span><br>
      <b>PVGIS v5.2 (EU JRC)</b> — solar PV yield (PVOUT), sampled inside each basin. <span class="src ext">EXT</span><br>
      <b>AQUASTAT</b> — national renewable-water total (~38 km³/yr), used to anchor the per-basin budget proxy. <span class="src ext">EXT</span></div>
      <h2 style="color:var(--navy);margin-top:14px">The model in one line</h2>
      <div class="eqn">minimise max<sub>b</sub> &nbsp;<span class="frac"><span>water drawn<sub>b</sub></span><span>avail<sub>b</sub>·share·(1−stress<sub>b</sub>)</span></span>&nbsp; s.t. Σ<i>P</i><sub>b</sub>=target</div>
      <p class="fine">Solved in closed form (water-filling: allocate capacity ∝ basin headroom). See the Learn tab,
      chapter E, for the derivation.</p>
    </div>`;
    $("reflist").innerHTML = [
      ["WRI Aqueduct 4.0 Water Risk Atlas", "https://www.wri.org/data/aqueduct-global-maps-40-data"],
      ["PVGIS (EU JRC) photovoltaic geographical information system", "https://re.jrc.ec.europa.eu/pvg_tools/en/"],
      ["FAO AQUASTAT — Portugal water resources", "https://www.fao.org/aquastat/"],
      ["A. Alves, WHEC 2026, Abstract 776 — Water Availability as a Constraint for Green H₂", "https://www.whec2026.org/"],
    ].map(([t, u]) => `<div><a href="${u}" target="_blank" rel="noopener">${t} ↗</a></div>`).join("");
  }

  // ---------- boot ----------
  async function boot() {
    const res = await fetch("basins.geojson");
    GEO = await res.json();
    BASINS = GEO.features.map((f) => f.properties);
    initMap();
    bindControls();
    applyHash();
    pushStateToInputs();
    syncLabels();
    recompute();
    renderLesson();
    renderAbout();
    $("mLearn").addEventListener("click", () => show("learn"));
    $("mSandbox").addEventListener("click", () => show("sandbox"));
    $("mAbout").addEventListener("click", () => show("about"));
    $("prevBtn").addEventListener("click", () => { if (li > 0) { li--; renderLesson(); } });
    $("nextBtn").addEventListener("click", () => { if (li < LESSONS.length - 1) { li++; renderLesson(); } });
    $("toSandbox").addEventListener("click", () => show("sandbox"));
    $("shareBtn").addEventListener("click", copyShare);
    $("csvBtn").addEventListener("click", exportCSV);
    $("printBtn").addEventListener("click", () => window.print());
    // open directly in sandbox if a shared scenario link was used
    if (location.hash.length > 1) show("sandbox");
    $("loading").style.display = "none";
  }
  boot().catch((e) => { $("loading").textContent = "Failed to load: " + e.message; });
})();
