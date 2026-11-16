import {demoRuleSeconds} from './demo-rule';
import test from 'node:test';import assert from 'node:assert/strict';
import {trackingInteraction,demoFace,demoBody} from './tracking-demo';
import {DwellGate} from './region';import {relationValue,relationFrame,DEFAULT_RELATION} from './relation';
import {newRelationRule,newTrackingRules,guideRuleDiffers} from './tracking-presets';
import {validateProject,type Project} from './core';
import {illustratedHand,handDemo} from './interaction-demo';
test('all six rule illustrations agree frame by frame with the production gate over two cycles',()=>{
 for(const mode of ['hand','face','pose'] as const)for(const kind of ['region','relation'] as const){
  const gate=new DwellGate();let events=0;
  for(let t=0;t<24000;t+=20){const d=trackingInteraction(mode,kind,t),r=d.region;
   const inside=kind==='relation'?relationValue(mode,relationFrame(mode,d.points),newRelationRule(mode))===true:d.tip.x>=r.x&&d.tip.x<=r.x+r.width&&d.tip.y>=r.y&&d.tip.y<=r.y+r.height;
   const actual=gate.step(inside?[.5,.5]:[0,.5],t,{x:.25,y:.25,width:.5,height:.5,seconds:demoRuleSeconds(kind)});
   assert.equal(d.hold,actual.progress,mode+kind+t);assert.equal(d.triggered,actual.state==='已触发，请移出区域',mode+kind+t);if(actual.fire)events++;
  }
  assert.equal(events,2,mode+kind);
 }
});
test('replay, paused queries and jumping between rule examples do not reuse another timeline',()=>{
 const snapshot=JSON.stringify(trackingInteraction('face','relation',5000));
 for(const mode of ['hand','face','pose'] as const)for(const kind of ['region','relation'] as const){trackingInteraction(mode,kind,11000);assert.equal(trackingInteraction(mode,kind,0).triggered,false);}
 assert.equal(JSON.stringify(trackingInteraction('face','relation',5000)),snapshot);
 assert.equal(handDemo('region',5000).hold,handDemo('region',5000).hold);
});
test('new rule projects start with the interaction they advertise',()=>{
 assert.equal(newTrackingRules('hand','region').region?.point,8);assert.equal(newTrackingRules('face','region').region?.point,1);assert.equal(newTrackingRules('pose','region').region?.point,15);
 const body=newTrackingRules('pose','relation').relation!;assert.equal(body.rule,'above');assert.equal(body.points,undefined);
 assert.equal(relationValue('pose',relationFrame('pose',demoBody(0,0)),body),false);assert.equal(relationValue('pose',relationFrame('pose',demoBody(0,1)),body),true);
 const face=newRelationRule('face');assert.equal(relationValue('face',relationFrame('face',demoFace(1)),face),false);assert.equal(relationValue('face',relationFrame('face',demoFace(0)),face),true);
 const hand=newRelationRule('hand');assert.equal(relationValue('hand',relationFrame('hand',illustratedHand(1)),hand),false);assert.equal(hand.threshold,DEFAULT_RELATION.threshold);assert.equal(hand.seconds,DEFAULT_RELATION.seconds);
 assert.deepEqual(newTrackingRules('face','dynamic'),{});
});
test('legacy and customized rules are retained and the guide signals a different example',()=>{
 const old:Project={schemaVersion:1,name:'legacy',mode:'pose',learning:'relation',feature:'shape',actions:[],updatedAt:'2026'};
 const loaded=validateProject(JSON.parse(JSON.stringify(old)));assert.equal(loaded.relation,undefined);assert.equal(guideRuleDiffers(loaded),true);
 const current={...loaded,...newTrackingRules('pose','relation')};assert.equal(guideRuleDiffers(current),false);
 assert.equal(guideRuleDiffers({...current,relation:{...current.relation!,points:[15,16]}}),true);
 const face={...loaded,mode:'face' as const,...newTrackingRules('face','relation')};assert.equal(guideRuleDiffers(face),false);assert.equal(guideRuleDiffers({...face,relation:{...face.relation!,seconds:2}}),true);
});
