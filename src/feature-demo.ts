import type {FeatureMode,Point} from './core';
import type {HandPath} from './hand-path';
export function demoHandReference(points:Point[],path:HandPath='palm'):Point{
 if(path==='index')return points[8];if(path==='wrist')return points[0];
 const ids=[0,5,9,13,17];return {x:ids.reduce((n,i)=>n+points[i].x,0)/ids.length,y:ids.reduce((n,i)=>n+points[i].y,0)/ids.length};
}
export const demoHandReferenceLabel=(path:HandPath)=>path==='palm'?'掌心移动轨迹':path==='index'?'食指尖轨迹':'手腕移动轨迹';
export const FEATURE_EXAMPLES:Record<FeatureMode,{title:string;example:string;watch:string}>={
 path:{title:'只看整体轨迹',example:'手形不变，挥手或画圈',watch:'看手往哪里移动'},
 shape:{title:'只看局部形变',example:'一 → 二 → 三，手指依次展开',watch:'看手指怎样变化'},
 both:{title:'形变 + 整体轨迹',example:'一边移动，一边张开手',watch:'同时看移动与手指变化'}
};
const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const smooth=(p:number)=>{const x=Math.max(0,Math.min(1,p));return x*x*(3-2*x);};
// A deliberately illustrated 21-landmark hand, not captured video or model output.
export function demoHand(feature:FeatureMode,progress:number,repeat=false):Point[]{
 const p=Math.max(0,Math.min(1,progress));
 const wrist={x:180,y:251};
 const fingers=[[[141,216],[120,204],[102,182],[89,164]],[[146,171],[144,127],[145,94],[146,69]],[[177,160],[177,111],[178,77],[178,50]],[[207,166],[211,124],[213,92],[214,70]],[[233,180],[242,148],[245,124],[249,105]]];
 const folded=[[[141,216],[131,202],[150,191],[171,185]],[[146,171],[147,160],[160,178],[155,195]],[[177,160],[177,151],[186,174],[177,193]],[[207,166],[207,159],[211,180],[201,198]],[[233,180],[234,176],[233,194],[219,208]]];
 const unfold=feature==='path'?[1,1,1,1,1]:feature==='shape'?[0,1,smooth((p-.2)/.18),smooth((p-.48)/.18),0]:Array(5).fill(smooth((p-.12)/.7));
 const move=feature==='shape'?0:feature==='path'?Math.sin(p*Math.PI*2)*64:-52+p*104;
 const y=feature==='path'?-Math.sin(p*Math.PI)*25:feature==='both'?-Math.sin(p*Math.PI)*18:0;
 const dx=move+(repeat&&feature==='shape'?19:0);
 return [wrist,...fingers.flatMap((finger,i)=>finger.map((v,j)=>({x:lerp(folded[i][j][0],v[0],unfold[i]),y:lerp(folded[i][j][1],v[1],unfold[i])})))].map(v=>({x:(v.x+dx)/360,y:(v.y+y)/280}));
}
export function demoNumber(progress:number){return progress<.34?'一':progress<.67?'二':'三';}
export function comparisonLabel(mode:'hand'|'face'|'pose',feature:FeatureMode,customFocus=false){
 if(feature==='shape')return mode==='hand'?'手指形变对照':mode==='face'?'面部形变对照':'身体姿态对照';
 if(feature==='both')return '形变与轨迹对照';
 return customFocus?'关注点中心轨迹':mode==='hand'?'手腕移动轨迹':mode==='face'?'头部移动轨迹':'身体中心轨迹';
}
