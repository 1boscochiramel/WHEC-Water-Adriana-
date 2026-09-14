'use strict';
// Independent enhancement keeps the supported-budget gate and original sliders intact.
let supplyRecords={};
function renderSupply(){
 const box=document.getElementById('supplyScenario');if(!box)return;
 const demand=SiteScreening.demand(plant());
 const list=selected.slice(0,Number($('siteCount').value)).map(f=>({f,r:f?supplyRecords[f.id]:null}));
 const number=n=>n===null?'Not established':fmt(n);
 box.innerHTML='<h2>Automatic annual water-balance scenario</h2><p><b>This is a conditional annual calculation, not available dry-period water.</b> It deducts reported reuse production from treated volume, then compares the annual-average residual with your plant intake. A positive difference does not establish feasibility.</p><div class="tablewrap"><table><thead><tr><th>Measure</th>'+list.map(({f})=>'<th>'+esc(f?.name||'Choose a source')+'</th>').join('')+'</tr></thead><tbody>'+[
 ['Reporting period',r=>r?.period||'Not established'],
 ['Treated water, m³/year',r=>r?number(r.treatedM3Year):'Not established'],
 ['Reported reuse production deducted, m³/year',r=>r?number(r.reuseM3Year):'Not established'],
 ['Conditional residual, m³/day',r=>r?number(r.residualM3Day):'Not established'],
 ['Plant intake, m³/day',()=>number(demand)],
 ['Conditional difference, m³/day',r=>number(SupplyScenario.assess(demand,r).margin)],
 ['Residual share the plant would require, %',r=>number(SupplyScenario.assess(demand,r).requiredSharePercent)],
 ['Dry-period available budget',()=> 'Not established']
 ].map(([label,fn])=>'<tr><th>'+esc(label)+'</th>'+list.map(({r})=>'<td>'+esc(fn(r))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 const ranked=list.filter(x=>x.r).sort((a,b)=>b.r.residualM3Day-a.r.residualM3Day);
 box.innerHTML+='<h3>Annual scenario comparison</h3><p>Order reflects conditional annual residual only. It is not a ranking of available water or site suitability.</p>'+(ranked.length?'<ol>'+ranked.map(({f,r})=>'<li>'+esc(f.name)+' — '+number(r.residualM3Day)+' m³/day conditional residual</li>').join('')+'</ol>':'<p>No selected source has matching annual treated-water and reuse evidence. Design capacity is not substituted for actual flow.</p>');
 box.innerHTML+=list.filter(x=>x.r).map(({f,r})=>'<details><summary>'+esc(f.name)+' · calculation and public evidence</summary><p>('+number(r.treatedM3Year)+' − '+number(r.reuseM3Year)+') ÷ '+r.days+' = '+number(r.residualM3Day)+' m³/day.</p><a href="'+esc(r.sourceUrl)+'" target="_blank" rel="noopener">Operator source ↗</a><h4>Scenario assumptions</h4><ul>'+r.assumptions.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><h4>Still needed for an available-water estimate</h4><ul>'+r.missing.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></details>').join('');
 if(receipt){receipt.release={version:'0.2.0-review',date:'2026-09-15',status:'research-review'};receipt.annualSupplyScenarios=list.map(({f,r})=>({id:f?.id||null,evidence:r||null,result:SupplyScenario.assess(demand,r)}));}
}
for(const id of ['plantMW','cf','energy','siteCount'])$(id).addEventListener(id==='siteCount'?'change':'input',renderSupply);
$('siteCards').addEventListener('change',renderSupply);
fetch('data/supply_scenarios.json').then(r=>{if(!r.ok)throw Error('Annual evidence unavailable');return r.json();}).then(j=>{supplyRecords=j.records;renderSupply();}).catch(err=>{$('supplyScenario').textContent=err.message;});
