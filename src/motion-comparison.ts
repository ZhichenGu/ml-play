import type {Action,Frame,Mode,Sample} from './core';
export function comparisonSamples(action:Action){return action.samples.map((sample,index)=>({sample,number:index+1})).filter(({sample})=>!sample.negative&&sample.split!=='test'&&sample.frames.length>1).reverse();}
export function frameAt(frames:Frame[],progress:number){if(!frames.length)return null;const time=frames[0].t+Math.max(0,Math.min(1,progress))*(frames.at(-1)!.t-frames[0].t);return frames.find(f=>f.t>=time)??frames.at(-1)!;}
export function brokenBefore(previous:Frame,current:Frame){return current.t<=previous.t||current.t-previous.t>220||!!(previous.handSide&&current.handSide&&previous.handSide!==current.handSide);}
export function traceSegments(frames:Frame[],lostBefore:number[]=[]){const lost=new Set(lostBefore),parts:Frame[][]=[];frames.forEach((f,i)=>{if(!i||lost.has(i)||brokenBefore(frames[i-1],f))parts.push([]);parts.at(-1)!.push(f);});return parts;}
export function alignFrames(frames:Frame[],feature:'shape'|'path'|'both'):Frame[]{if(!frames.length)return [];const origin=frames[0].root;const scales=frames.map(f=>f.scale).sort((a,b)=>a-b);const scale=Math.max(.015,scales[Math.floor(scales.length/2)]);return frames.map(f=>{const root=feature==='shape'?[.5,.55]:[.5+(f.root[0]-origin[0])/scale*.16,.55+(f.root[1]-origin[1])/scale*.16];return {...f,root:root as [number,number],points:f.points.map(p=>({...p,x:root[0]+(p.x-f.root[0])/scale*.16,y:root[1]+(p.y-f.root[1])/scale*.16})),scale:f.scale/scale*.16};});}
export function comparisonPointIds(mode:Mode,focus?:number[]){return focus??(mode==='hand'?Array.from({length:21},(_,i)=>i):mode==='face'?[1,4,33,133,263,362,61,291,13,14,152,10]:[11,12,13,14,15,16,23,24,25,26,27,28]);}
export function sampleForComparison(frames:Frame[]):Sample{return {id:'comparison-only',duration:frames.length>1?frames.at(-1)!.t-frames[0].t:0,negative:false,frames};}

// A comparison segment never crosses a loss, scope change or camera session.
export class ComparisonCapture {
 private frames:Frame[]=[];
 private since=0;
 private interrupted=false;
 reset(now:number){this.frames=[];this.since=now;this.interrupted=false;}
 lose(){this.interrupted=true;}
 append(frame:Frame,duration:number){
  if(frame.t<this.since||frame.t===this.frames.at(-1)?.t)return false;
  const previous=this.frames.at(-1);
  if(this.interrupted||(previous&&brokenBefore(previous,frame)))this.frames=[];
  this.interrupted=false;
  this.frames=[...this.frames,frame].filter(f=>frame.t-f.t<=Math.min(15000,Math.max(3000,duration))).slice(-900);
  return true;
 }
 snapshot(duration=15000){const end=this.frames.at(-1)?.t??0;return this.frames.filter(f=>end-f.t<=duration);}
 trail(now:number){return this.interrupted?[]:this.frames.filter(f=>now-f.t<1500);}
}

/** Align local shape to the current target without carrying over its recorded path. */
export function shapeOverlayFrame(mode:Mode,reference:Frame,current:Frame):Frame {
 const anchor=(f:Frame)=>mode==='hand'?f.points[0]:mode==='face'?f.points[1]:f.points[23]&&f.points[24]?{x:(f.points[23].x+f.points[24].x)/2,y:(f.points[23].y+f.points[24].y)/2}:undefined;
 const from=anchor(reference)??{x:reference.root[0],y:reference.root[1]},to=anchor(current)??{x:current.root[0],y:current.root[1]};
 const ratio=current.scale/Math.max(.015,reference.scale);
 return {...reference,scale:current.scale,root:[to.x+(reference.root[0]-from.x)*ratio,to.y+(reference.root[1]-from.y)*ratio],points:reference.points.map(p=>({...p,x:to.x+(p.x-from.x)*ratio,y:to.y+(p.y-from.y)*ratio}))};
}
