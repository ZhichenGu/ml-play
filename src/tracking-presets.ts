import type {Mode,Project} from './core';
import {DEFAULT_RELATION,defaultRelationPoints,type RelationConfig} from './relation';
import {DEFAULT_REGION} from './region';
import type {LearningMode} from './learning';
/** Only for new projects. Existing/imported rules keep their stored semantics. */
export function newTrackingRules(mode:Mode,learning:LearningMode){
 if(learning==='relation')return {relation:newRelationRule(mode)};
 if(learning==='region')return {region:{...DEFAULT_REGION,point:mode==='hand'?8:mode==='face'?1:15}};
 return {};
}
export function newRelationRule(mode:Mode):RelationConfig{
 return {...DEFAULT_RELATION,rule:mode==='pose'?'above':'distance',threshold:mode==='face'?.08:DEFAULT_RELATION.threshold};
}
/** Explain a saved/custom rule without silently rewriting it to the starter example. */
export function guideRuleDiffers(project:Project){
 if(project.learning==='region'){
  const r=project.region??DEFAULT_REGION,target=project.mode==='hand'?8:project.mode==='face'?1:15;
  return (r.point??(project.mode==='face'?1:0))!==target||r.seconds!==DEFAULT_REGION.seconds;
 }
 if(project.learning!=='relation')return false;
 const r=project.relation??DEFAULT_RELATION,example=newRelationRule(project.mode);
 if(r.rule!==example.rule||r.seconds!==example.seconds||r.rule==='distance'&&r.threshold!==example.threshold)return true;
 if(project.mode==='pose'&&r.rule==='above')return r.points!==undefined;
 const pair=r.points??defaultRelationPoints(project.mode),expected=defaultRelationPoints(project.mode);
 return !pair.every(id=>expected.includes(id));
}
