import {buildDemoRuleTimeline,demoRuleTime,demoRuleSeconds,DEMO_RULE_STEP} from './demo-rule';
import {newRelationRule} from './tracking-presets';
import {relationFrame,relationValue} from './relation';
import type {Point} from './core';
import {demoHand} from './feature-demo';
export type HandDemoKind='pose'|'continuous'|'region'|'relation'|'coordinates';
export const HAND_DEMOS:Record<HandDemoKind,{title:string;caption:string}>={
 pose:{title:'区分握拳和张掌',caption:'为握拳和张掌各建一个动作，分别录制、训练，再识别当前姿态。'},
 continuous:{title:'手掌越张开，数值越大',caption:'分别录制 0 和 1 对应的姿态，训练后用张开程度控制数值。'},
 region:{title:'指尖停在指定区域',caption:'选一个点并设置区域；在区域内停留达标后触发，离开后可再次触发。'},
 relation:{title:'拇指与食指捏合',caption:'选择两个点并设置距离；捏合保持达标后触发，松开后可再次触发。'},
 coordinates:{title:'直接输出手部坐标',caption:'选择检测点和坐标轴，位置变化会持续变成数值，无需录制或训练。'}
};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const smooth=(p:number)=>{const v=Math.max(0,Math.min(1,p));return v*v*(3-2*v);};
export function illustratedHand(openness:number):Point[]{
 const a=demoHand('both',0),b=demoHand('both',1);
 return a.map((v,i)=>({x:mix(v.x,b[i].x-(b[0].x-a[0].x),openness)+.145,y:mix(v.y,b[i].y,openness)}));
}
/** Illustrative states only. These never enter production recognition or output. */
function handDemoRaw(kind:HandDemoKind,time:number){
 const ms=Math.max(0,time)%12000,p=ms/12000,learned=kind==='pose'||kind==='continuous';
 const phase=learned?(ms<3400?'record':ms<4400?'train':'run'):'run';
 const run=Math.max(0,(ms-4400)/7600);
 let openness=learned?(phase==='record'?(ms<1700?0:1):phase==='train'?1:kind==='pose'?(run<.5?0:1):.5-.5*Math.cos(run*Math.PI*2)):1;
 let points=illustratedHand(openness);
 if(kind==='relation'){
  const close=smooth((p-.12)/.12)*(1-smooth((p-.7)/.12));
  const a=points[4],b=points[8],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  points=points.map((v,i)=>i===4||i===8?{x:mix(v.x,center.x,close),y:mix(v.y,center.y,close)}:v);

 }
 if(kind==='region'||kind==='coordinates'){
  const target=kind==='region'?{x:mix(.24,.66,smooth((p-.08)/.2))-(smooth((p-.76)/.17)*.42),y:.37}:{x:.5+.22*Math.sin(p*Math.PI*2),y:.39-.13*Math.cos(p*Math.PI*2)};
  const dx=target.x-points[8].x,dy=target.y-points[8].y;
  points=points.map(v=>({...v,x:v.x+dx,y:v.y+dy}));

 }
 return {points,phase,openness,value:openness,category:openness<.5?'握拳':'张掌',tip:points[8]};
}

const handTimelines=new Map<HandDemoKind,ReturnType<typeof buildDemoRuleTimeline>>();
export function handDemo(kind:HandDemoKind,time:number){
 const isRule=kind==='region'||kind==='relation',at=isRule?demoRuleTime(time):time,d=handDemoRaw(kind,at);
 if(!isRule)return {...d,hold:0,triggered:false};
 if(!handTimelines.has(kind))handTimelines.set(kind,buildDemoRuleTimeline(t=>{
  const f=handDemoRaw(kind,t);return kind==='region'?f.tip.x>=.56&&f.tip.x<=.78&&f.tip.y>=.23&&f.tip.y<=.51:
   relationValue('hand',relationFrame('hand',f.points),newRelationRule('hand'))===true;
 },demoRuleSeconds(kind)));
 return {...d,...handTimelines.get(kind)![at/DEMO_RULE_STEP]};
}
