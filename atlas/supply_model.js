(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else root.SupplyScenario=f();})(typeof globalThis!=='undefined'?globalThis:this,function(){
function assess(demand,r){
 if(!Number.isFinite(demand)||demand<0)throw Error('Invalid water demand');
 if(!r||r.status!=='conditional-annual-scenario'||!r.period||!Number.isFinite(r.residualM3Day)||r.residualM3Day<0)return {margin:null,requiredSharePercent:null,status:'insufficient-evidence'};
 return {margin:r.residualM3Day-demand,requiredSharePercent:r.residualM3Day>0?100*demand/r.residualM3Day:null,status:'conditional-annual-scenario',period:r.period};
}
return {assess};});
