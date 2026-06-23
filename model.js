/* model.js — quantitative engine for the WHEC-Water sandbox (Portugal).
   Pure functions, runs live in the browser. Constants tagged EXT/CALC in the UI.

   Physical chain per basin b (see course chapters A–E):
     CF_b   = PVOUT_b / 8760
     H2/MW  = CF_b*8760*1000 / E            (E kWh/kg)        [EXT]
     water  = H2 * L/1000  m3               (L L/kg)          [EXT]
     stress = monthly bws (if a month picked) else annual     [EXT Aqueduct]
     alloc  = avail * share * (1-stressNorm)                  [CALC budget]
     BURDEN = freshwater_draw / alloc      (>1 over budget)

   Desalination: a COASTAL basin may draw seawater instead of freshwater, so its
   freshwater burden -> 0, at an LCOH premium (desal capex/energy/brine).

   LCOH (eur/kg) per basin = electrolyser capex + electricity + water (+ desal):
     capexTerm = capexPerKw*crf / (CF*8760/E)
     elecTerm  = E * elecPrice/1000
     waterTerm = (L/1000)*waterCost ; desal nodes add desalPremium

   Optimiser (distributed): minimise max burden -> closed-form water-filling,
   P_b proportional to basin headroom capacity.
*/
(function (global) {
  "use strict";
  const HOURS = 8760;
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const DEFAULTS = {
    targetMW: 1000, nNodes: 5,
    eKWhPerKg: 55,        // EXT electrolyser system energy
    lPerKg: 18,           // EXT process water (stoich 9)
    allocShare: 0.005,    // CALC licensable share of basin water
    monthIndex: -1,       // -1 = annual avg; 0..11 = Jan..Dec (real Aqueduct monthly)
    desalOn: false,       // coastal basins may use seawater desal
    desalPremium: 0.40,   // CALC eur/kg added for desal nodes (capex+energy+brine)
    elecPrice: 40,        // EXT eur/MWh solar PPA
    capexPerKw: 1200,     // EXT eur/kW electrolyser installed
    crf: 0.10,            // CALC annualised capex fraction (discount+life+fixed O&M)
    waterCost: 0.80,      // EXT eur/m3 freshwater
    solarFloor: 0, stressCeiling: 5,
  };

  function stressNorm(b, p) {
    const raw = (p.monthIndex >= 0 && b.bws_monthly) ? b.bws_monthly[p.monthIndex] : b.bws_score;
    return Math.max(0, Math.min(1, raw / 5));
  }
  function waterPerMW(b, p) { return (b.pvout / HOURS) * HOURS * 1000 / p.eKWhPerKg * p.lPerKg / 1000; }
  function h2PerMW(b, p) { return (b.pvout / HOURS) * HOURS * 1000 / p.eKWhPerKg; }
  function usesDesal(b, p) { return !!(p.desalOn && b.coastal); }
  function allocatable(b, p) {
    if (usesDesal(b, p)) return 1e12;           // seawater: effectively unconstrained freshwater
    return Math.max(1, b.avail_m3_yr * p.allocShare * (1 - stressNorm(b, p)));
  }
  function freshwaterDraw(b, p, mw) { return usesDesal(b, p) ? 0 : mw * waterPerMW(b, p); }
  function capacityMW(b, p) { return allocatable(b, p) / waterPerMW(b, p); }
  function eligible(b, p) { return b.pvout >= p.solarFloor && b.bws_score <= p.stressCeiling; }

  function lcoh(b, p) {
    const cf = b.pvout / HOURS;
    const kgPerKwYr = cf * HOURS / p.eKWhPerKg;          // kg H2 per kW per yr
    const capexTerm = (p.capexPerKw * p.crf) / kgPerKwYr;
    const elecTerm = p.eKWhPerKg * p.elecPrice / 1000;   // eur/kg
    const waterTerm = (p.lPerKg / 1000) * p.waterCost;   // eur/kg
    const desalAdd = usesDesal(b, p) ? p.desalPremium : 0;
    return capexTerm + elecTerm + waterTerm + desalAdd;
  }

  function allocate(basins, p, strategy, manual) {
    const out = new Map();
    if (strategy === "manual") { (manual || []).forEach(([id, mw]) => out.set(id, mw)); return out; }
    const elig = basins.filter((b) => eligible(b, p));
    if (strategy === "single") {
      const pool = elig.length ? elig : basins;
      const best = pool.reduce((a, b) => (b.pvout > a.pvout ? b : a));
      out.set(best.pfaf_id, p.targetMW); return out;
    }
    const ranked = elig.slice().sort((a, b) => capacityMW(b, p) - capacityMW(a, p));
    const chosen = ranked.slice(0, Math.max(1, p.nNodes));
    const caps = chosen.map((b) => capacityMW(b, p));
    const sum = caps.reduce((a, c) => a + c, 0) || 1;
    chosen.forEach((b, i) => out.set(b.pfaf_id, p.targetMW * caps[i] / sum));
    return out;
  }

  function evaluate(basins, p, alloc) {
    let peak = 0, totalH2 = 0, totalWater = 0, totalMW = 0, over = 0, costNum = 0, desalMW = 0;
    const rows = basins.map((b) => {
      const mw = alloc.get(b.pfaf_id) || 0;
      const water = freshwaterDraw(b, p, mw);
      const burden = water / allocatable(b, p);
      const h2 = mw * h2PerMW(b, p);
      const cost = lcoh(b, p);
      if (mw > 0) {
        peak = Math.max(peak, burden);
        totalH2 += h2; totalWater += water; totalMW += mw; costNum += cost * h2;
        if (burden > 1) over++;
        if (usesDesal(b, p)) desalMW += mw;
      }
      return { b, mw, water, burden, h2, lcoh: cost, desal: usesDesal(b, p) };
    });
    return { rows, peakBurden: peak, totalH2, totalWater, totalMW, basinsOver: over,
      nNodes: rows.filter((r) => r.mw > 0).length,
      avgLCOH: totalH2 ? costNum / totalH2 : 0, desalShare: totalMW ? desalMW / totalMW : 0 };
  }

  function run(basins, p, strategy, manual) { return evaluate(basins, p, allocate(basins, p, strategy, manual)); }

  global.WModel = { HOURS, MONTHS, DEFAULTS, run, allocate, evaluate,
    waterPerMW, h2PerMW, allocatable, capacityMW, eligible, stressNorm, lcoh, usesDesal };
})(window);
