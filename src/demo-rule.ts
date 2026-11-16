import {DwellGate,DEFAULT_REGION} from './region';
import {DEFAULT_RELATION} from './relation';
export const DEMO_CYCLE=12000,DEMO_RULE_STEP=20;
export const demoRuleSeconds=(kind:string)=>kind==='region'?DEFAULT_REGION.seconds:DEFAULT_RELATION.seconds;
export const demoRuleTime=(time:number)=>Math.floor((Math.max(0,time)%DEMO_CYCLE)/DEMO_RULE_STEP)*DEMO_RULE_STEP;
/** Replay the same gate used by the workbench. No actual output is sent. */
export function buildDemoRuleTimeline(insideAt:(time:number)=>boolean,seconds:number){
 const gate=new DwellGate();
 return Array.from({length:DEMO_CYCLE/DEMO_RULE_STEP},(_,i)=>{
  const time=i*DEMO_RULE_STEP,result=gate.step(insideAt(time)?[.5,.5]:[0,.5],time,{x:.25,y:.25,width:.5,height:.5,seconds});
  return {hold:result.progress,triggered:result.state==='已触发，请移出区域'};
 });
}
