/* course.js — "Water as a Constraint for Green Hydrogen" interactive course.
   Informed-practitioner / conference-Q&A depth. Defines global LESSONS,
   consumed by app.js. Each lesson can drive the sandbox via `set`.
   Block conventions inside body HTML:
     <div class="eqn">...</div>     equation     <div class="example">...</div>  worked example
     <div class="litnote">...</div> from sources  <div class="defends">...</div>  "you can now answer"
   Optional check {q, opts:[{t,ok}], reveal}. Real numbers come straight from basins.geojson.
*/
const LESSONS = [
// ===================== A — WATER IS THE CONSTRAINT =====================
{ch:"A · Water is the constraint", title:"Splitting water: the irreducible 9 kg",
 set:{strategy:"distributed", layer:"stress", targetMW:500, nNodes:5},
 body:`<p>Green hydrogen is made by electrolysis — passing renewable electricity through water:</p>
 <div class="eqn">2 H<sub>2</sub>O → 2 H<sub>2</sub> + O<sub>2</sub></div>
 <p>Mass bookkeeping sets a hard floor. Two water molecules (36 g) yield two H<sub>2</sub> (4 g), so the <b>stoichiometric minimum is 9 kg of water per kg of H<sub>2</sub></b>. No technology beats this — it's chemistry.</p>
 <div class="eqn">m<sub>H₂O</sub> / m<sub>H₂</sub> = 36 / 4 = <b>9</b> &nbsp;<span class="src ext">EXT stoichiometry</span></div>
 <p>But real plants also lose water to <b>deionisation reject</b> (raw water must be ultrapure) and sometimes <b>cooling</b>. Practical demand is roughly <b>18–24 L/kg H<sub>2</sub></b>.</p>
 <div class="litnote"><b>📚 From the literature.</b> IRENA and IEA cite ~9 kg stoichiometric and ~18–24 kg total feedwater per kg H₂ for PEM/alkaline once purification losses are included; seawater desalination adds brine but little net freshwater draw.</div>
 <div class="defends">🛡️ You can now answer: <i>"How much water does electrolysis really need?"</i> — 9 kg/kg is the floor; ~18 L/kg is a defensible plant figure. Both are sliders in the Sandbox.</div>`},

{ch:"A · Water is the constraint", title:"From megawatts to hydrogen to water",
 set:{strategy:"distributed", layer:"solar"},
 body:`<p>A node's water draw follows a short chain. Start from electrical capacity <i>P</i> (MW) and its <b>capacity factor</b> CF (the fraction of the year it effectively runs at full power, set by the solar resource):</p>
 <div class="eqn"><i>ṁ</i><sub>H₂</sub> = <span class="frac"><span><i>P</i> · CF · 8760 · 1000</span><span><i>E</i></span></span> &nbsp; kg/yr &nbsp;<span class="src ext">E ≈ 55 kWh/kg</span></div>
 <p>where <i>E</i> is electrolyser energy intensity (kWh per kg). Then water is just hydrogen × intensity:</p>
 <div class="eqn"><i>V</i><sub>water</sub> = <i>ṁ</i><sub>H₂</sub> · <i>L</i><sub>per kg</sub> &nbsp; <span class="src ext">L ≈ 18 L/kg</span></div>
 <div class="example"><b>Worked.</b> 1 MW at CF = 0.18 (a sunny Portuguese basin): <i>ṁ</i><sub>H₂</sub> = 1·0.18·8760·1000 / 55 ≈ <b>28 700 kg/yr</b>, needing ≈ 28 700·18 ≈ <b>516 m³</b> of water per MW per year.</div>
 <div class="defends">🛡️ This whole chain is the engine: pull <b>E</b> or <b>L</b> in the Sandbox and every basin's water draw rescales live.</div>`},

{ch:"A · Water is the constraint", title:"The scale surprise — why a tiny demand still bites",
 set:{strategy:"single", layer:"stress", targetMW:500},
 body:`<p>Here is the counter-intuitive part. That ~516 m³/MW/yr is <b>minuscule</b> next to a basin's total renewable water (often thousands of millions of m³). So why is water a constraint at all?</p>
 <p>Because the binding quantity isn't total water — it's <b>uncommitted headroom</b>. In a basin already withdrawing most of its supply for farming and cities, there is essentially <b>no spare allocation</b>, and no social or regulatory licence to add more — however small your absolute draw.</p>
 <div class="eqn">constraint ≠ <i>V</i><sub>water</sub> vs total &nbsp;&nbsp; constraint = <i>V</i><sub>water</sub> vs <b>headroom</b></div>
 <div class="defends">🛡️ You can now answer the killer Q&A line: <i>"Electrolysis water is trivial vs agriculture — why model it?"</i> — Because allocation, not volume, is the limit; in an over-allocated basin the marginal litre is the contested one.</div>`,
 check:{q:"Two basins need the same small water draw. Which is the real constraint?",
  opts:[{t:"The one already at extreme water stress (no headroom)",ok:true},
        {t:"The larger basin (more total water)",ok:false}],
  reveal:"Headroom, not size. A big but over-allocated basin can be <i>harder</i> to site in than a small, unstressed one. This is exactly the lever the Sandbox models."}},

// ===================== B — THE SOLAR RESOURCE =====================
{ch:"B · The solar resource", title:"Capacity factor from solar yield",
 set:{strategy:"distributed", layer:"solar"},
 body:`<p>The solar layer comes from <b>PVGIS</b> (EU JRC): the long-term PV output <b>PVOUT</b> in kWh per kWp per year. Divide by the hours in a year to get the capacity factor:</p>
 <div class="eqn">CF = <span class="frac"><span>PVOUT</span><span>8760</span></span> &nbsp;<span class="src calc">CALC from PVGIS</span></div>
 <div class="example"><b>Worked.</b> Our sunniest basin, Beja, has PVOUT ≈ <b>1615</b> → CF ≈ 1615/8760 ≈ <b>0.184</b>. The cloudy north-west (~1323) gives CF ≈ 0.151. Higher CF means more hydrogen per installed MW — and more water drawn.</div>
 <div class="defends">🛡️ You can now answer: <i>"Where does capacity factor come from?"</i> — Real PVGIS irradiance, sampled at interior points of each basin and averaged.</div>`},

{ch:"B · The solar resource", title:"Where the sun is best — and a warning",
 set:{strategy:"distributed", layer:"solar"},
 body:`<p>Portugal's solar resource rises smoothly from north-west to south: PVOUT spans roughly <b>1320 → 1615 kWh/kWp/yr</b>. On solar alone, you'd build everything in the <b>south</b> (Beja, Évora, Setúbal).</p>
 <div class="eqn">argmax<sub>b</sub> PVOUT<sub>b</sub> → southern Alentejo</div>
 <p>Hold that thought. The next chapter maps a <i>second</i> field — water stress — that points in almost the opposite direction. The clash between them is the entire subject of this course.</p>
 <div class="defends">🛡️ Foreshadowing: "best sun" is a one-variable answer. Real siting is at least two-variable.</div>`},

// ===================== C — MAPPING WATER STRESS =====================
{ch:"C · Mapping water stress", title:"What 'water stress' actually means",
 set:{strategy:"single", layer:"stress"},
 body:`<p>The water layer is the WRI <b>Aqueduct 4.0</b> baseline water stress (BWS): the ratio of total human withdrawals to available renewable supply in a basin.</p>
 <div class="eqn">BWS = <span class="frac"><span>withdrawals</span><span>available renewable supply</span></span> &nbsp;<span class="src ext">EXT Aqueduct 4.0</span></div>
 <p>Aqueduct reports it on a <b>0–5 score</b>: &lt;1 is low stress, &gt;4 is "extremely high" (the basin already withdraws &gt;80 % of its supply). We carry the raw score and normalise it to 0–1 for the model.</p>
 <div class="litnote"><b>📚 From the literature.</b> Aqueduct 4.0 (WRI, 2023) computes BWS on hydrological sub-basins from a global hydrological model plus sectoral withdrawal data — the standard open layer for water-risk screening.</div>
 <div class="defends">🛡️ You can now answer: <i>"What's your water-stress source and definition?"</i> — Aqueduct 4.0 BWS, withdrawals÷supply, 0–5, area-weighted onto each hydrobasin.</div>`},

{ch:"C · Mapping water stress", title:"Basin scale — and an honest limit",
 set:{strategy:"single", layer:"stress"},
 body:`<p>Aqueduct's unit is the <b>hydrobasin</b>. Mainland Portugal resolves to just <b>13 basins</b>. That is coarse: a single basin can hide a wet valley and a dry plateau.</p>
 <p>This is the boundary of public data — and precisely where Alves' <b>project-scale spatial assessment</b> adds value below us. This course builds the <b>screening layer</b>; her contribution is the finer resolution beneath it.</p>
 <div class="defends">🛡️ You can now answer the sharpest Q&A: <i>"Basin-scale stress misses project-scale variation."</i> — Correct, and stated up front: this is a first-pass filter, not a permit-grade, site-specific assessment.</div>`,
 check:{q:"A basin shows 'medium' stress overall. Is it safe to site anywhere inside it?",
  opts:[{t:"No — sub-basin variation can hide a stressed pocket",ok:true},
        {t:"Yes — the basin average covers it",ok:false}],
  reveal:"No. Basin averages smear over local detail; that resolution gap is exactly the project-scale work this screening layer sits on top of."}},

{ch:"C · Mapping water stress", title:"Building a water budget per basin",
 set:{strategy:"distributed", layer:"budget"},
 body:`<p>To turn a withdrawal into a meaningful "share of the basin's water", we need an absolute renewable volume. Aqueduct gives only the <i>ratio</i>, so we build a budget transparently:</p>
 <div class="eqn"><i>A</i><sub>b</sub> = q(lat) · area<sub>b</sub> &nbsp;→ rescaled so Σ<i>A</i><sub>b</sub> = 38 km³/yr &nbsp;<span class="src calc">CALC · <span class="src ext" style="margin:0">EXT AQUASTAT total</span></span></div>
 <p>where <i>q</i>(lat) is a north→south runoff proxy (wet north ~700 mm, dry south ~150 mm). The <b>pattern</b> is modelled; the national <b>magnitude</b> is pinned to AQUASTAT's ~38 km³/yr. Then the part actually available to new hydrogen shrinks with existing stress:</p>
 <div class="eqn">allocatable<sub>b</sub> = <i>A</i><sub>b</sub> · share · (1 − stress<sub>b</sub>)</div>
 <p>Stress here is real Aqueduct data — and can be the <b>annual</b> figure or a specific <b>month</b> (next chapters). The lower a basin's stress, the more of its water is free for new hydrogen.</p>
 <div class="defends">🛡️ You can now answer: <i>"Where do basin water volumes come from?"</i> — A runoff proxy anchored to a published national total; the real Aqueduct stress then sets how much of it is free. Share and stress-ceiling are sliders.</div>`},

// ===================== D — THE SPATIAL MISMATCH =====================
{ch:"D · The spatial mismatch", title:"The Setúbal paradox",
 set:{strategy:"single", layer:"viability", targetMW:500},
 body:`<p>Now overlay the two fields. Look at <b>Setúbal</b>, on the sunny south-west coast:</p>
 <div class="example"><b>Setúbal (real data):</b> PVOUT <b>1603</b> (2nd-best sun in Portugal) · water stress <b>4.7 / 5</b> (extremely high) · viability <b>0.055</b> (almost the worst).</div>
 <p>Near the best sunlight in the country — and almost the worst place to build, because the water is already fully spoken for. You <b>cannot fix this by trying harder at Setúbal</b>: there is no water to allocate. The only moves are to bring water in (desalination/pipeline) or to <b>go somewhere else</b>.</p>
 <div class="eqn">max(sun) and min(water stress) are <b>not co-located</b></div>
 <div class="defends">🛡️ This single basin is the entire argument for a distributed network — and it fell straight out of public data, not a model assumption.</div>`,
 check:{q:"Setúbal has near-best sun. Why is its viability near-zero?",
  opts:[{t:"Extreme water stress — no headroom for new draw",ok:true},
        {t:"Poor solar resource",ok:false},
        {t:"It's too far from ports",ok:false}],
  reveal:"Water. Switch the Sandbox to a single mega-plant and watch its burden spike when the optimiser is forced onto the sunniest — but driest — basin."}},

{ch:"D · The spatial mismatch", title:"The viability score — and why it multiplies",
 set:{strategy:"distributed", layer:"viability"},
 body:`<p>We fuse the two layers into one screening score. Normalise solar and stress to 0–1, then <b>multiply</b>:</p>
 <div class="eqn">viability<sub>b</sub> = solar<sub>b</sub><sup>norm</sup> · (1 − stress<sub>b</sub><sup>norm</sup>) &nbsp;<span class="src calc">CALC</span></div>
 <p>Why multiply, not average? Because water is a <b>binding</b> constraint, not a tradeable one. Averaging lets brilliant sun paper over extreme stress; multiplying drives viability to zero the moment <i>either</i> factor fails — which is the physical truth.</p>
 <div class="example"><b>Top of the list:</b> Castelo Branco (interior) — PVOUT 1571, stress <b>0.0</b> → viability <b>0.85</b>. Good sun <i>and</i> water headroom. The sweet spot is inland, not the sunniest coast.</div>
 <div class="defends">🛡️ You can now answer: <i>"How did you combine the layers?"</i> — Multiplicatively, so water stress acts as a hard gate, not a discount.</div>`},

// ===================== E — THE DISTRIBUTED NETWORK =====================
{ch:"E · The distributed network", title:"The burden metric",
 set:{strategy:"single", layer:"nodes", targetMW:500},
 body:`<p>Define each basin's <b>burden</b> under a siting plan: the water a node draws divided by what the basin can spare.</p>
 <div class="eqn"><i>B</i><sub>b</sub> = <span class="frac"><span><i>V</i><sub>water,b</sub></span><span>allocatable<sub>b</sub></span></span> &nbsp;,&nbsp; <i>B</i><sub>b</sub> &gt; 1 ⇒ over budget</div>
 <p>Burden &gt; 1 means the plan asks a basin for more water than it can give. The whole siting problem is now one number: <b>keep every basin's burden below 1</b>, and the <i>highest</i> burden anywhere is what limits you.</p>
 <div class="defends">🛡️ The Sandbox draws a burden bar per active basin; the tallest bar is the plan's peak burden — the thing to minimise.</div>`},

{ch:"E · The distributed network", title:"One mega-plant vs many nodes",
 set:{strategy:"single", layer:"nodes", targetMW:800, nNodes:5},
 body:`<p>Put a single large plant on the best-solar basin (the naive optimum). All the water demand lands on <b>one</b> basin — and if that basin is stressed (it usually is, because sun and dryness correlate), its burden spikes far above 1.</p>
 <p>Spread the same target across several basins and each carries a slice. The objective is to minimise the <b>worst</b> basin:</p>
 <div class="eqn">minimise &nbsp;max<sub>b</sub> <i>B</i><sub>b</sub> &nbsp; subject to &nbsp;Σ<sub>b</sub> <i>P</i><sub>b</sub> = target</div>
 <p>This is a <b>minimax</b> problem — protect the most-stressed point rather than the average.</p>
 <div class="defends">🛡️ Toggle Single ↔ Distributed in the Sandbox at a high target: watch the peak-burden number collapse as load spreads.</div>`,
 check:{q:"Why minimise the MAX burden, not the average?",
  opts:[{t:"A single over-drawn basin is a hard failure; averages hide it",ok:true},
        {t:"It's easier to compute",ok:false}],
  reveal:"Because one basin past burden 1 breaks the plan regardless of how comfortable the others are. Minimax protects the binding constraint."}},

{ch:"E · The distributed network", title:"The water-filling solution (derivation)",
 set:{strategy:"distributed", layer:"nodes", targetMW:800, nNodes:6},
 body:`<p>Here is the payoff — a closed form, no solver. Each basin's burden is <b>linear</b> in its node size: <i>B</i><sub>b</sub> = <i>P</i><sub>b</sub> · (water/MW)<sub>b</sub> / allocatable<sub>b</sub>. Define a basin's <b>headroom capacity</b> — the MW that brings it to burden 1:</p>
 <div class="eqn"><i>C</i><sub>b</sub> = <span class="frac"><span>allocatable<sub>b</sub></span><span>(water/MW)<sub>b</sub></span></span></div>
 <p><b>Claim:</b> the minimax optimum makes every active basin's burden <i>equal</i>. If one basin had a higher burden than another, you could shift a sliver of capacity off it onto the slacker basin, lowering the max — so at the optimum no such move exists, i.e. all burdens are equal to some λ.</p>
 <div class="eqn"><i>B</i><sub>b</sub> = λ ⇒ <i>P</i><sub>b</sub> = λ <i>C</i><sub>b</sub> &nbsp;,&nbsp; Σ<i>P</i><sub>b</sub> = target ⇒ λ = <span class="frac"><span>target</span><span>Σ<i>C</i><sub>b</sub></span></span></div>
 <p>So <b>allocate capacity in proportion to headroom</b>, <i>P</i><sub>b</sub> = target · <i>C</i><sub>b</sub> / Σ<i>C</i><sub>b</sub>, and the resulting peak burden is target / Σ<i>C</i><sub>b</sub>. Bigger combined headroom ⇒ lower peak burden. That <i>is</i> the case for the distributed network, in one equation.</p>
 <div class="example"><b>Worked intuition.</b> Two basins, capacities 600 and 200 MW, target 400 MW → λ = 400/800 = 0.5; they take 300 and 100 MW, both at burden 0.5. Neither is overloaded; the stressed/low-capacity basin is protected.</div>
 <div class="defends">🛡️ You can now answer: <i>"Is your optimiser principled or ad-hoc?"</i> — It's the exact minimax solution: equalise burdens, allocate ∝ headroom. The Sandbox runs this live every time you move a slider.</div>`},

// ===================== F — REALITY =====================
{ch:"F · Reality & limits", title:"Seasonality — the real monthly data",
 set:{strategy:"distributed", layer:"stress", month:6, targetMW:600},
 body:`<p>Annual averages hide the worst case. Aqueduct also publishes <b>monthly</b> water stress, and Iberia's pattern is brutal: stress peaks in <b>summer — exactly when solar is strongest.</b> The two constraints collide in time, not just space.</p>
 <div class="example"><b>Setúbal, real monthly stress:</b> ~2.1 in winter, climbing to the <b>5.0 ceiling in Jun–Aug</b>, back to 2.4 by December. Coimbra holds 5.0 for July–September. The sunniest, driest months are the same months.</div>
 <p>Move the <b>Season</b> slider in the Sandbox from "Annual" to July: every basin's headroom shrinks and burdens jump — because <i>(1 − stress)</i> collapses where summer stress hits 5.</p>
 <p>A distributed network answers this naturally: <b>throttle</b> dry-month nodes down and lean on basins that still have water. Solar is intermittent anyway, so modulating production is already in the design — water seasonality rides the same control.</p>
 <div class="defends">🛡️ You can now answer: <i>"Did you use annual averages and miss the summer?"</i> — No: real Aqueduct monthly stress is built in; switch to July and watch the south go over budget.</div>`,
 check:{q:"Why is summer the dangerous season for solar hydrogen in Portugal?",
  opts:[{t:"Best sun and worst water stress coincide",ok:true},
        {t:"Solar panels work worse when hot",ok:false}],
  reveal:"Both peak together. Setúbal's stress hits 5.0 in Jul–Aug, the very months its solar is best — the spatial mismatch becomes a temporal one too."}},

{ch:"F · Reality & limits", title:"Alternative water: desalination",
 set:{strategy:"distributed", layer:"lcoh", desal:true, month:6, targetMW:600},
 body:`<p>If a coastal basin has no fresh water to spare, you can make your own — <b>seawater desalination</b> (or treated wastewater). This is the escape hatch a project-scale assessment must consider, and a live WHEC theme.</p>
 <p>In the model, a <b>coastal</b> basin with desal enabled draws seawater, so its freshwater burden drops to <b>zero</b> — the water constraint relaxes. But it isn't free: desalination adds capex, energy and brine handling, a premium on the cost of hydrogen:</p>
 <div class="eqn">LCOH<sub>desal</sub> = LCOH<sub>fresh</sub> + premium &nbsp;<span class="src calc">CALC</span></div>
 <p>Toggle <b>Allow seawater desal</b> in the Sandbox with July selected: <b>Setúbal</b> — impossible on summer freshwater — becomes feasible, but its cost layer ticks up. The constraint moved from <i>water</i> to <i>cost</i>.</p>
 <div class="litnote"><b>📚 Connects to:</b> desalination-integrated electrolysis (e.g. thermally-mediated desal–electrolysis) was a neighbouring WHEC 2026 topic; only ~7 of Portugal's 13 basins are coastal, so desal is a coastal-only lever here.</div>
 <div class="defends">🛡️ You can now answer: <i>"Why not just desalinate?"</i> — You can, on the coast; it converts a hard water limit into a cost premium, which the LCOH layer then makes visible.</div>`,
 check:{q:"Desalination removes the freshwater limit at a coastal basin. What replaces it as the binding trade-off?",
  opts:[{t:"Cost — the desal premium on €/kg",ok:true},
        {t:"Nothing, desal is free",ok:false},
        {t:"Solar resource",ok:false}],
  reveal:"Cost. Desal trades a water constraint for a cost premium — visible on the LCOH layer and the avg €/kg stat."}},

{ch:"F · Reality & limits", title:"Putting a price on it — LCOH",
 set:{strategy:"distributed", layer:"lcoh", targetMW:1000},
 body:`<p>Developers don't decide on viability scores — they decide on <b>€/kg</b>. The levelised cost of hydrogen sums the real cost drivers:</p>
 <div class="eqn">LCOH = <span class="frac"><span>capex · crf</span><span>CF · 8760 / E</span></span> + E·<i>p</i><sub>elec</sub> + water (+ desal) &nbsp;<span class="src calc">CALC</span></div>
 <p>The first term (electrolyser capex spread over annual output) <b>shrinks where the sun is strong</b> — high CF means more kg per installed kW. So the sunniest basins are the <b>cheapest</b>… which are often the most water-stressed. The cost layer and the water layer pull in opposite directions — the same tension as viability, now in euros.</p>
 <div class="example"><b>Worked.</b> At €1200/kW, crf 0.10, CF 0.18 (Beja), E 55: capex term ≈ 120 / (0.18·8760/55) ≈ <b>€4.2/kg</b>; electricity ≈ 55·0.04 ≈ <b>€2.2/kg</b>; water a few cents. Total ≈ <b>€6.5/kg</b> — switch the map to the <b>Cost €/kg</b> layer to see it vary by basin.</div>
 <div class="defends">🛡️ You can now answer: <i>"What does this cost?"</i> — A transparent LCOH (capex + electricity + water/desal), per basin, with every input a slider. Note: transport-to-demand is out of scope here.</div>`,
 check:{q:"Why are the sunniest basins usually the cheapest per kg H₂?",
  opts:[{t:"Higher capacity factor spreads fixed capex over more output",ok:true},
        {t:"Solar panels are cheaper in the south",ok:false}],
  reveal:"Capacity factor. More sun → more kg/kW/yr → the capex term (capex·crf ÷ annual output) falls. But those basins are often the most water-stressed — the core tension, now priced."}},

{ch:"F · Reality & limits", title:"What this is — and isn't",
 set:{strategy:"distributed", layer:"viability"},
 body:`<p>Be honest about the boundary of the tool:</p>
 <p>• <b>Screening, not permitting.</b> Basin-scale, modelled stress — a first filter, not a site decision.<br>
 • <b>Physical, not legal.</b> Water <i>permits and allocations</i> aren't public; we model availability, not the right to use it.<br>
 • <b>Transparent assumptions.</b> The water budget, desal premium and capex factor are CALC screening values — every one is a slider, so you test sensitivity rather than trust a single number.</p>
 <p>What it <i>does</i> do — now with <b>real monthly stress</b>, a <b>desalination</b> option and a <b>cost (LCOH)</b> layer — is turn "water as a constraint" from a slogan into a map, a season, and a price, on 100 % public data, that a developer can interrogate <i>before</i> spending money.</p>
 <div class="litnote"><b>📚 Connects to:</b> Alves (WHEC 2026, Abstract 776) on project-scale water-constrained siting; desalination-integrated electrolysis and inter-seasonal supply-chain optimisation were neighbouring WHEC themes this screening layer now folds in.</div>
 <div class="defends">🛡️ You've finished the course. Open the <b>Sandbox</b> and reproduce any claim live — the single-plant burden spike, the inland sweet spot, the July stress jump, desal unlocking Setúbal, and the cost map.</div>`}
];
