import React from 'react';
import type {Point} from './core';
import type {FigureMode} from './tracking-demo';
/** Same palette, outline and landmark treatment as the illustrated hand. */
export function TrackingFigure({mode,points,highlight=true}:{mode:FigureMode;points:Point[];highlight?:boolean}){
 const xy=(i:number)=>`${points[i].x*360},${points[i].y*280}`;
 if(mode==='face'){
  const nose=points[1],cx=nose.x*360,cy=(nose.y-.02)*280,upper=points[13],lower=points[14];
  const jawDrop=(points[152].y-nose.y-.31)*280;
  const mouthY=(upper.y+lower.y)/2*280,mouthR=Math.max(1.5,(lower.y-upper.y)*140);
  return <g>
  <path d={`M ${cx-20} ${cy+75} V ${cy+105} Q ${cx} ${cy+119} ${cx+20} ${cy+105} V ${cy+75}`} fill="#ead1b5" stroke="#c9aa89" strokeWidth="1.5"/>
  <path d={`M ${cx-20} ${cy+101} Q ${cx-75} ${cy+104} ${cx-85} ${cy+128} H ${cx+85} Q ${cx+75} ${cy+104} ${cx+20} ${cy+101} Q ${cx} ${cy+118} ${cx-20} ${cy+101}`} fill="#e3eaf0" stroke="#b7c8d5" strokeWidth="1.5"/>
  {[-1,1].map(side=><ellipse key={side} cx={cx+side*70} cy={cy+4} rx="8" ry="17" fill="#ead1b5" stroke="#c9aa89" strokeWidth="1.4"/>)}
  <path d={`M ${cx} ${cy-91} C ${cx+48} ${cy-94} ${cx+76} ${cy-52} ${cx+70} ${cy+6} C ${cx+67} ${cy+53+jawDrop*.5} ${cx+38} ${cy+88+jawDrop} ${cx} ${cy+90+jawDrop} C ${cx-38} ${cy+88+jawDrop} ${cx-67} ${cy+53+jawDrop*.5} ${cx-70} ${cy+6} C ${cx-76} ${cy-52} ${cx-48} ${cy-94} ${cx} ${cy-91}`} fill="#f0dbc3" stroke="#c9aa89" strokeWidth="1.7"/>
  <path d={`M ${cx-68} ${cy-28} Q ${cx-78} ${cy-87} ${cx-12} ${cy-95} Q ${cx+60} ${cy-104} ${cx+70} ${cy-34} Q ${cx+31} ${cy-58} ${cx+3} ${cy-76} Q ${cx-29} ${cy-58} ${cx-68} ${cy-28}`} fill="#b9aa97" stroke="#aa9985" strokeWidth="1.5"/>
  {[33,362].map(id=><g key={id}><path d={`M ${points[id].x*360-1} ${points[id].y*280-11} q 15 -5 29 0`} fill="none" stroke="#a28e7a" strokeWidth="2.2" strokeLinecap="round"/><path d={`M ${points[id].x*360} ${points[id].y*280} q 14 -6 28 0 q -14 6 -28 0`} fill="#fafafa" stroke="#b49f8c" strokeWidth="1.2"/><circle cx={points[id].x*360+14} cy={points[id].y*280} r="2.7" fill="#5d707b"/></g>)}
  <path d={`M ${cx+1} ${cy-9} q -1 13 -4 22 q 5 4 10 0`} fill="none" stroke="#c3a58b" strokeWidth="1.5" strokeLinecap="round"/>
  {mouthR>3?<><ellipse cx={cx} cy={mouthY} rx={(points[291].x-points[61].x)*180} ry={mouthR} fill="#a78472" stroke="#b18e7e" strokeWidth="1.6"/>{mouthR>6&&<path d={`M ${cx-17} ${mouthY-mouthR+3} Q ${cx} ${mouthY-mouthR+1} ${cx+17} ${mouthY-mouthR+3}`} stroke="#f7eee6" strokeWidth="3" strokeLinecap="round"/>}</>:<path d={`M ${points[61].x*360} ${mouthY} Q ${cx} ${mouthY+3} ${points[291].x*360} ${mouthY}`} fill="none" stroke="#b18e7e" strokeWidth="1.8" strokeLinecap="round"/>}
  <g fill="#4f83ad" opacity={highlight?.7:.3}>{[1,13,14,61,291].map(i=><circle key={i} cx={points[i].x*360} cy={points[i].y*280} r="1.8"/>)}</g></g>;
 }
 const chains=[[11,13,15],[12,14,16],[23,25,27,31],[24,26,28,32]];
 return <g><path d={`M ${xy(11)} L ${xy(12)} L ${xy(24)} L ${xy(23)} Z`} fill="#ead1b5" stroke="#c9aa89" strokeWidth="2"/>
 {chains.map((ids,i)=><g key={i}><polyline points={ids.map(xy).join(' ')} fill="none" stroke="#c9aa89" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round"/><polyline points={ids.map(xy).join(' ')} fill="none" stroke="#f0dbc3" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/></g>)}
 <path d={`M ${points[0].x*360} ${points[0].y*280+14} V ${(points[11].y+points[12].y)*140}`} stroke="#c9aa89" strokeWidth="13"/>
 <circle cx={points[0].x*360} cy={points[0].y*280} r="19" fill="#f0dbc3" stroke="#c9aa89" strokeWidth="2"/>
 <g opacity={highlight?.85:.3} fill="#4f83ad" stroke="#4f83ad" strokeWidth="1.2">{[...chains,[11,12],[11,23],[12,24],[23,24]].map((ids,i)=><polyline key={i} points={ids.map(xy).join(' ')} fill="none"/>)}{[0,11,12,13,14,15,16,23,24,25,26,27,28].map(i=><circle key={i} cx={points[i].x*360} cy={points[i].y*280} r="2.4"/>)}</g></g>;
}
