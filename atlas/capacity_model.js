(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.HydrogenCapacity=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function num(v,name,min,max){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(name+' must be a number from '+min+' to '+max);return v;}
function assess(c){
 num(c.energy,'Electricity use',1,1000);num(c.feed,'Purified feedwater',0.001,1000);num(c.recovery,'Recovery',0.001,100);num(c.cooling,'Additional cooling intake',0,10000);num(c.cf,'Operating factor',0.001,100);num(c.share,'Screening share',0,100);num(c.supplyFactor,'Supply remaining',0,100);num(c.plantMW,'Plant capacity',0,1e8);
 if(!Array.isArray(c.periods)||!c.periods.length||c.periods.length>120)throw Error('Supply one to 120 periods.');
 const intakeLkg=c.feed/(c.recovery/100)+c.cooling,fullLoadPerMWDay=24*intakeLkg/c.energy,intakePerMWDay=fullLoadPerMWDay*c.cf/100,hydrogenKgDay=c.plantMW*1000*24*c.cf/100/c.energy;
 let missing=false;
 const periods=c.periods.map(p=>{if(typeof p.period!=='string'||!p.period.trim())throw Error('Every period needs a label.');for(const k of ['supply','existing','reserve'])if(p[k]!==null)num(p[k],k,0,1e12);if(['supply','existing','reserve'].some(k=>p[k]===null)){missing=true;return {period:p.period,thresholdMW:null,missing:true};}
 const supply=p.supply*c.supplyFactor/100,remaining=Math.max(0,supply-p.existing-p.reserve),budget=remaining*c.share/100,intake=c.plantMW*intakePerMWDay;
 return {period:p.period,supply,existing:p.existing,reserve:p.reserve,remaining,budget,intake,thresholdMW:budget/intakePerMWDay,fullLoadThresholdMW:budget/fullLoadPerMWDay,shareOfRemaining:remaining>0?100*intake/remaining:null,aboveScreeningShare:intake>budget+1e-9,alreadyOvercommitted:p.existing+p.reserve>supply,shortfall:Math.max(0,intake-remaining)};});
 const critical=missing?null:periods.reduce((a,b)=>a.thresholdMW<=b.thresholdMW?a:b),thresholdMW=critical?critical.thresholdMW:null;
 return {status:missing?'missing':'scenario',intakeLkg,intakePerMWDay,hydrogenKgDay,intakeM3Day:c.plantMW*intakePerMWDay,thresholdMW,fullLoadThresholdMW:critical?critical.fullLoadThresholdMW:null,limitingPeriod:critical?critical.period:null,hydrogenAtThresholdKgDay:thresholdMW===null?null:thresholdMW*1000*24*c.cf/100/c.energy,periods};
}
function parseMonthly(text){const lines=text.trim().split(/\r?\n/);if(lines.shift()?.trim()!=='month,supply_m3_day,existing_m3_day,reserve_m3_day')throw Error('Use the exact monthly CSV header shown.');if(!lines.length)throw Error('Add monthly rows.');let previous=null;return lines.map(line=>{const a=line.split(',').map(s=>s.trim());if(a.length!==4||!/^\d{4}-(0[1-9]|1[0-2])$/.test(a[0]))throw Error('Each row needs YYYY-MM and three daily rates.');const [y,m]=a[0].split('-').map(Number),key=y*12+m;if(previous!==null&&key!==previous+1)throw Error('Months must be consecutive and unique.');previous=key;const vals=a.slice(1).map(v=>v===''?null:num(Number(v),'Monthly rate',0,1e12));return {period:a[0],supply:vals[0],existing:vals[1],reserve:vals[2]};});}
return {assess,parseMonthly};});
