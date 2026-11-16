import {demoRuleSeconds} from './demo-rule';
import test from 'node:test';import assert from 'node:assert/strict';
import {demoFace,demoBody,trackingDynamic,trackingInteraction,trackingExamples,TRACKING_DEMOS} from './tracking-demo';
import {extract,energy,sequence,buildTemplates,match,type Action,type FeatureMode} from './core';
import {buildAnchors,predictValue} from './continuous';
import {buildPosePrototypes,poseScores} from './learning';
import {DwellGate} from './region';import {relationFrame,relationValue} from './relation';
import en from './locales/en.json';
import {buildLabTemplates,labMatch,LAB_DEFAULTS} from './lab-motion';
import type {Project} from './core';
const modes=['face','pose'] as const;
test('face and body illustrations retain valid landmark topology and distinguish path from local change',()=>{
 for(const mode of modes)for(const feature of ['path','shape','both'] as FeatureMode[]){
  const fs=Array.from({length:43},(_,i)=>extract(mode,trackingDynamic(mode,feature,i/42),[],i*2800/42)!);
  assert.ok(fs.every(f=>f&&f.points.length===(mode==='face'?478:33)));
  assert.ok(energy(sequence(fs,feature))>.025,mode+feature);
  if(feature==='path')assert.ok(energy(sequence(fs,'shape'))<1e-10);
  if(feature==='shape')assert.ok(energy(sequence(fs,'path'))<1e-10);
  const action:Action={id:'demo',name:'demo',threshold:.7,effect:'indicator',color:'#ddd',trained:true,samples:[{id:'s',frames:fs,duration:2800,negative:false}]};
  const replay=Array.from({length:43},(_,i)=>extract(mode,trackingDynamic(mode,feature,i/42,true),[],i*2800/42)!);
  assert.ok(match(replay,buildTemplates([action],feature),feature).demo>.99,mode+feature);
 }
});
test('illustrated categories are actually separable and intermediate poses interpolate with production helpers',()=>{
 for(const mode of modes){const make=(v:number)=>extract(mode,mode==='face'?demoFace(v):demoBody(v))!;
  const actions:Action[]=[0,1].map(v=>({id:String(v),name:String(v),controlValue:v,threshold:.7,effect:'indicator',color:'#ddd',trained:true,samples:[{id:'s'+v,duration:700,negative:false,frames:Array.from({length:11},(_,i)=>({...make(v),t:i*70}))}]}));
  const anchors=buildAnchors(actions),prototypes=buildPosePrototypes(actions);
  for(const v of [0,1]){assert.equal(predictValue(make(v).shape,anchors),v);const scores=poseScores(actions[v].samples[0].frames,prototypes);assert.ok(scores[String(v)]>scores[String(1-v)]);}
  const middle=predictValue(make(.5).shape,anchors);assert.ok(middle!==null&&middle>.2&&middle<.8,mode);
 }
});
test('all ten new non-dynamic demonstrations keep coordinates and timers finite throughout the cycle',()=>{
 for(const mode of modes)for(const kind of ['pose','continuous','region','relation','coordinates'] as const)for(let t=0;t<12000;t+=40){const d=trackingInteraction(mode,kind,t);assert.ok(d.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));assert.ok(d.hold>=0&&d.hold<=1);assert.deepEqual(d.tip,d.points[mode==='face'?1:15]);}
});
test('region and relation illustrations agree with actual rule predicates; each hold fires once',()=>{
 for(const mode of modes)for(const kind of ['region','relation'] as const){
  const gate=new DwellGate();let events=0;
  for(let t=0;t<12000;t+=20){const d=trackingInteraction(mode,kind,t);
   const condition=kind==='region'?d.tip.x>=d.region.x&&d.tip.x<=d.region.x+d.region.width&&d.tip.y>=d.region.y&&d.tip.y<=d.region.y+d.region.height:
    relationValue(mode,relationFrame(mode,d.points),mode==='face'?{points:[13,14],rule:'distance',threshold:.08,seconds:.8}:{rule:'above',threshold:.5,seconds:.8});
   if(d.hold>0)assert.equal(condition,true,mode+kind+t);
   if(gate.step(condition?[.5,.5]:[0,0],t,{x:.25,y:.25,width:.5,height:.5,seconds:demoRuleSeconds(kind)}).fire)events++;
  }
  assert.equal(events,1,mode+kind);assert.equal(trackingInteraction(mode,kind,5000).triggered,true);assert.equal(trackingInteraction(mode,kind,11500).triggered,false);
 }
});
test('every new example and introduction has English text',()=>{
 const dict=en as Record<string,string>;
 for(const mode of modes){for(const meta of Object.values(TRACKING_DEMOS[mode]))for(const text of Object.values(meta))assert.ok(dict[text],text);for(const meta of Object.values(trackingExamples(mode)))for(const text of Object.values(meta))assert.ok(dict[text],text);}
});
test('all six dynamic examples match the enhanced pipeline, with a synthetic face expression coefficient',()=>{
 // The real face detector supplies expression coefficients as well as geometry.
 // This coefficient represents mouth openness; it is synthetic, not captured model output.
 const frame=(mode:'face'|'pose',feature:FeatureMode,p:number,repeat=false)=>extract(mode,trackingDynamic(mode,feature,p,repeat),mode==='face'?[feature==='path'?0:Math.sin(p*Math.PI)**2]:[],p*2800)!;
 for(const mode of modes)for(const feature of ['path','shape','both'] as FeatureMode[]){
  const fs=Array.from({length:43},(_,i)=>frame(mode,feature,i/42));
  const action:Action={id:'demo',name:'demo',threshold:.7,effect:'indicator',color:'#ddd',trained:true,samples:[{id:'s',frames:fs,duration:2800,negative:false}]};
  const project:Project={schemaVersion:1,name:'demo',mode,feature,learning:'dynamic',lab:{...LAB_DEFAULTS},actions:[action],updatedAt:'2026-11-16'};
  const templates=buildLabTemplates(project),input=Array.from({length:43},(_,i)=>frame(mode,feature,i/42,true));
  const scores=input.map((_,i)=>i<9?0:labMatch(input.slice(0,i+1),templates,project).demo??0);
  assert.ok(Math.max(...scores)>.7,mode+feature);
 }
});
