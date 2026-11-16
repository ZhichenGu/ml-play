import type {HandPath} from './hand-path';
import {TrackingFigure} from './TrackingFigure';
import {trackingDynamic,trackingExamples} from './tracking-demo';
import React,{useEffect,useRef,useState} from 'react';
import {Check,Pause,Play,RotateCcw,X,ArrowRight} from 'lucide-react';
import type {FeatureMode,Point,Mode} from './core';
import {t} from './i18n';
import {demoHand,demoNumber,FEATURE_EXAMPLES,demoHandReference,demoHandReferenceLabel} from './feature-demo';
const chains=[[0,1,2,3,4],[0,5,6,7,8],[5,9,10,11,12],[9,13,14,15,16],[13,17,18,19,20],[0,17]];
export function Hand({points,highlight=false}:{points:Point[];highlight?:boolean}){
 const xy=(i:number)=>`${points[i].x*360},${points[i].y*280}`;
 return <g><path d={`M ${xy(0)} L ${xy(1)} L ${xy(5)} L ${xy(9)} L ${xy(13)} L ${xy(17)} L ${points[0].x*360+20},${points[0].y*280-3} Z`} fill="#ead1b5" stroke="#d5b493" strokeWidth="2"/>{[1,5,9,13,17].map(start=><g key={start}><polyline points={[start,start+1,start+2,start+3].map(xy).join(' ')} fill="none" stroke="#c9aa89" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round"/><polyline points={[start,start+1,start+2,start+3].map(xy).join(' ')} fill="none" stroke="#f0dbc3" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/></g>)}<g opacity={highlight?.95:.35} stroke="#4f83ad" fill="none" strokeWidth="1.3">{chains.map((ids,i)=><polyline key={i} points={ids.map(xy).join(' ')}/>)}{points.map((p,i)=><circle key={i} cx={p.x*360} cy={p.y*280} r={highlight?2.4:1.8} fill={highlight?'#4f83ad':'#f8fafc'} stroke="#4f83ad" strokeWidth=".6"/>)}</g></g>;
}
function DemoScene({feature,progress,repeat=false,active=true,mode='hand',handPath='palm'}:{handPath?:HandPath;feature:FeatureMode;progress:number;repeat?:boolean;active?:boolean;mode?:Mode}){
 if(mode!=='hand')return <FigureDemoScene mode={mode} feature={feature} progress={progress} repeat={repeat} active={active}/>;
 const points=demoHand(feature,progress,repeat);
 const center=(ps:Point[])=>demoHandReference(ps,handPath);
 const palm=center(points);const path=Array.from({length:51},(_,i)=>center(demoHand(feature,i/50,repeat)));
 const traced=path.slice(0,Math.max(1,Math.ceil(progress*50)));
 const line=(ps:Point[])=>ps.map(p=>`${p.x*360},${p.y*280}`).join(' ');
 return <svg viewBox={feature==='shape'?'90 35 200 230':'10 15 340 265'} aria-label={t(feature==='path'?demoHandReferenceLabel(handPath):FEATURE_EXAMPLES[feature].watch)} className={active?'':'demo-scene-muted'}>
 <path d="M 34 252 H 326" stroke="#e1e8ef" strokeWidth="1"/>
 {feature!=='shape'&&<><polyline points={line(path)} fill="none" stroke="#becfdd" strokeWidth="2" strokeDasharray="4 5"/><polyline points={line(traced)} fill="none" stroke="#5592bf" strokeWidth="3.5" strokeLinecap="round"/><circle cx={path[0].x*360} cy={path[0].y*280} r="5" fill="#fff" stroke="#90abc0" strokeWidth="1.5"/></>}
 <Hand points={points} highlight={feature!=='path'}/>
 {feature==='shape'&&<circle cx={points[progress<.34?8:progress<.67?12:16].x*360} cy={points[progress<.34?8:progress<.67?12:16].y*280} r="10" fill="#7aa8cc" fillOpacity=".16" stroke="#7aa8cc" strokeOpacity=".5" strokeWidth="1"/>}
 {feature==='shape'&&<text className="demo-number" x="275" y="64">{demoNumber(progress)==='一'?'1':demoNumber(progress)==='二'?'2':'3'}</text>}
 {feature==='path'&&<circle cx={palm.x*360} cy={palm.y*280} r="7" fill="#4f83ad" stroke="#fff" strokeWidth="2"/>}
 </svg>;
}
function FigureDemoScene({mode,feature,progress,repeat,active}:{mode:'face'|'pose';feature:FeatureMode;progress:number;repeat:boolean;active:boolean}){
 const points=trackingDynamic(mode,feature,progress,repeat),root=(ps:Point[])=>mode==='face'?ps[1]:{x:(ps[23].x+ps[24].x)/2,y:(ps[23].y+ps[24].y)/2};
 const path=Array.from({length:51},(_,i)=>root(trackingDynamic(mode,feature,i/50,repeat))),center=root(points),line=(ps:Point[])=>ps.map(p=>`${p.x*360},${p.y*280}`).join(' ');
 return <svg viewBox="0 0 360 280" aria-label={t(trackingExamples(mode)[feature].watch)} className={active?'':'demo-scene-muted'}><TrackingFigure mode={mode} points={points} highlight={feature!=='path'}/>{feature!=='shape'&&<><polyline points={line(path)} fill="none" stroke="#becfdd" strokeWidth="2" strokeDasharray="4 5"/><polyline points={line(path.slice(0,Math.max(1,Math.ceil(progress*50))))} fill="none" stroke="#5592bf" strokeWidth="3.5" strokeLinecap="round"/></>}{feature==='path'?<circle cx={center.x*360} cy={center.y*280} r="7" fill="#4f83ad" stroke="white" strokeWidth="2"/>:(mode==='face'?[13,14]:[15,16]).map(id=><circle key={id} cx={points[id].x*360} cy={points[id].y*280} r="9" fill="#cf9e6a" fillOpacity=".17" stroke="#c19a6d" strokeOpacity=".5"/>)}</svg>;
}
export function FeatureGuide({value,mode='hand',handPath='palm',onConfirm,onClose}:{handPath?:HandPath;mode?:Mode;value:FeatureMode;onConfirm:(v:FeatureMode)=>void;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),confirm=useRef<HTMLButtonElement>(null);const [selected,setSelected]=useState(value),[playing,setPlaying]=useState(false),[time,setTime]=useState(0),[playKey,setPlayKey]=useState(0);const elapsed=useRef(0);
 const reduced=useRef(typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const d=dialog.current!;d.showModal();confirm.current?.focus({preventScroll:true});if(!reduced.current)setPlaying(true);return()=>d.close();},[]);
 useEffect(()=>{if(!playing)return;let id=0;const start=performance.now()-elapsed.current;const tick=(now:number)=>{elapsed.current=(now-start)%9600;setTime(elapsed.current);id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[playing,selected,playKey]);
 function choose(v:FeatureMode){setSelected(v);elapsed.current=0;setTime(0);setPlayKey(k=>k+1);setPlaying(!reduced.current);}
 const examples=trackingExamples(mode),watch=mode==='hand'&&selected==='path'?demoHandReferenceLabel(handPath):examples[selected].watch;
 const first=Math.min(1,time/2800),second=Math.max(0,Math.min(1,(time-3500)/2800)),fired=time>=6500;
 return <dialog ref={dialog} className="feature-guide" aria-labelledby="feature-guide-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
 <header><div><h2 id="feature-guide-title">{t('你的动作主要怎么变化？')}</h2><p>{t('点选一种方式，看看示意动画。')}</p></div><button type="button" className="icon-button" aria-label={t('关闭学习方式介绍')} onClick={onClose}><X size={18}/></button></header>
 <div className="feature-guide-options" role="group" aria-label={t('选择学习方式')}>{(['path','shape','both'] as FeatureMode[]).map(id=><button type="button" key={id} aria-pressed={selected===id} onClick={()=>choose(id)}><span className="guide-option-top"><strong>{t(examples[id].title)}</strong><i>{selected===id?<Check size={14}/>:null}</i></span><span>{t(examples[id].example)}</span></button>)}</div>
 <div className="feature-demo"><div className="feature-demo-heading"><strong>{t(watch)}</strong><span>{t('动画示意')}</span></div><div className="demo-stages"><section className={time<3500?'is-current':''}><div className="demo-stage-heading"><span className="demo-step">1</span><h3>{t('录制示范')}</h3><span className="demo-stage-progress"><i style={{width:first*100+'%'}}/></span></div><DemoScene handPath={handPath} mode={mode} feature={selected} progress={first}/></section><div className="demo-transfer"><span>{t('训练后')}</span><ArrowRight className="demo-stage-arrow" size={18}/></div><section className={time>=3500?'is-current':''}><div className="demo-stage-heading"><span className="demo-step">2</span><h3>{t('再做一次')}</h3><span className="demo-stage-progress"><i style={{width:second*100+'%'}}/></span></div><DemoScene handPath={handPath} mode={mode} feature={selected} progress={second} repeat active={time>=3500}/></section></div>
 <div className="demo-caption"><span>{t(mode==='hand'?(selected==='path'?'手形保持不变，记录移动路线。':selected==='shape'?'手指按一、二、三变化，不要求站在同一位置。':'移动路线和手指变化一起参与比较。'):mode==='face'?(selected==='path'?'表情保持不变，记录头部移动路线。':selected==='shape'?'张嘴再闭嘴，比较表情变化，不要求站在同一位置。':'头部移动路线和表情变化一起参与比较。'):(selected==='path'?'姿态保持不变，记录身体中心的移动路线。':selected==='shape'?'抬起再放下手臂，比较关节变化，不要求站在同一位置。':'身体移动路线和关节变化一起参与比较。'))}</span><span className={'demo-trigger '+(fired?'is-fired':'')}><i/>{t(fired?'触发一次 · 示意':'完整做完这一组')}</span></div>
 <div className="demo-playback"><button type="button" className="text-button" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={14}/>:<Play size={14}/>} {t(playing?'暂停动画':'播放动画')}</button><button type="button" className="text-button" onClick={()=>{elapsed.current=0;setTime(0);setPlayKey(k=>k+1);setPlaying(true);}}><RotateCcw size={13}/>{t('重新看一遍')}</button></div></div>
 <footer><button ref={confirm} type="button" className="primary" onClick={()=>onConfirm(selected)}>{t('确定')}<Check size={16}/></button></footer>
 </dialog>;
}
