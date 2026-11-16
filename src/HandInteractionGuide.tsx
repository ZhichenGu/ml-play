import {demoRuleSeconds} from './demo-rule';
import {TrackingFigure} from './TrackingFigure';
import {trackingInteraction,TRACKING_DEMOS,trackingLabels} from './tracking-demo';
import type {Mode} from './core';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,Pause,Play,RotateCcw,X} from 'lucide-react';
import {Hand} from './FeatureGuide';
import {HAND_DEMOS,handDemo,type HandDemoKind} from './interaction-demo';
import {t} from './i18n';

export function HandInteractionGuide({kind,mode='hand',dual=false,exampleSettingsDiffer=false,onClose}:{kind:HandDemoKind;exampleSettingsDiffer?:boolean;mode?:Mode;dual?:boolean;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),confirm=useRef<HTMLButtonElement>(null),elapsed=useRef(0);
 const [playing,setPlaying]=useState(()=>!matchMedia('(prefers-reduced-motion: reduce)').matches),[time,setTime]=useState(0),[replay,setReplay]=useState(0);
 useEffect(()=>{const d=dialog.current!;d.showModal();confirm.current?.focus({preventScroll:true});return()=>d.close();},[]);
 useEffect(()=>{if(!playing)return;let id=0;const start=performance.now()-elapsed.current;const tick=(now:number)=>{elapsed.current=(now-start)%12000;setTime(elapsed.current);id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[playing,replay]);
 const d=trackingInteraction(mode,kind,time),meta=(mode==='hand'?HAND_DEMOS:TRACKING_DEMOS[mode])[kind],learned=kind==='pose'||kind==='continuous',ready=d.phase==='run';
 const tip=d.tip,thumb=d.points[d.markerIds[1]??4],labels=trackingLabels(mode);
 const secondDemo=handDemo('coordinates',time+3000),second=secondDemo.tip;
 const stageText=learned?(d.phase==='record'?kind==='pose'?'分别录制两种姿态':'分别录制 0 和 1':d.phase==='train'?'训练中 · 示意':kind==='continuous'?'训练后 · 连续输出数值':'训练后 · 识别当前姿态'):'直接配置，无需训练';
 const status=kind==='region'||kind==='relation'?(d.triggered?'已触发 · 保持时不重复':d.hold>0?'保持中…':kind==='region'?(mode==='hand'?'等待指尖进入区域':mode==='face'?'等待鼻尖进入区域':'等待手腕进入区域'):(mode==='hand'?'松开后可再次触发':mode==='face'?'张嘴后可再次触发':'放下手臂后可再次触发')):stageText;
 return <dialog ref={dialog} className={'feature-guide interaction-guide '+(kind==='coordinates'&&dual?'coordinate-illustration':'')} aria-labelledby="hand-interaction-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
 <header><div><h2 id="hand-interaction-title">{t(meta.title)}</h2><p>{t(meta.caption)}</p></div><button className="icon-button" type="button" aria-label={t('关闭交互示意')} onClick={onClose}><X size={18}/></button></header>
 <div className="feature-demo interaction-demo"><div className="feature-demo-heading"><strong>{t(stageText)}</strong><span>{t('动画示意')}</span></div>
 <div className="interaction-stages"><section><h3>{t('你的动作')}</h3><svg viewBox={mode!=='hand'?'0 0 360 280':kind==='coordinates'&&dual?'0 35 360 210':kind==='region'||kind==='coordinates'?'0 0 360 340':'70 25 220 250'} aria-label={t(meta.title)}>

 {mode!=='hand'?<TrackingFigure mode={mode} points={d.points}/>:kind==='coordinates'&&dual?<>{[d,secondDemo].map((hand,i)=><g key={i} transform={`translate(${i*170} 55) scale(.5)`}><Hand points={hand.points} highlight/><circle cx={hand.tip.x*360} cy={hand.tip.y*280} r="9" fill={i?'#b88750':'#5685ad'}/><text x="180" y="310" textAnchor="middle" fill="#708396" fontSize="24">{t(i?'右手':'左手')}</text></g>)}</>:<g transform={kind==='pose'||kind==='continuous'?`translate(0 ${-50*(1-d.openness)})`:undefined}><Hand points={d.points} highlight/></g>}
 {kind==='region'&&<rect x={d.region.x*360} y={d.region.y*280} width={d.region.width*360} height={d.region.height*280} rx="9" fillOpacity=".18" fill={d.hold?'#e5eff8':'#edf2f6'} stroke="#89aac5" strokeWidth="1.5" strokeDasharray="5 4"/>}
 {(kind==='region'||kind==='coordinates'&&!dual)&&<><circle cx={tip.x*360} cy={tip.y*280} r="12" fill="#cf9e6a" fillOpacity=".17"/><circle cx={tip.x*360} cy={tip.y*280} r="4" fill="#b6814b" stroke="white" strokeWidth="1.5"/></>}
 {kind==='relation'&&<>{mode==='pose'?<line x1="70" y1={d.points[11].y*280} x2="290" y2={d.points[12].y*280} stroke="#bb8c58" strokeWidth="1.5" strokeDasharray="4 4"/>:<line x1={d.points[d.markerIds[0]].x*360} y1={d.points[d.markerIds[0]].y*280} x2={thumb.x*360} y2={thumb.y*280} stroke="#bb8c58" strokeWidth="2" strokeDasharray="3 3"/>}{d.markerIds.map(id=>d.points[id]).map((p,i)=><circle key={i} cx={p.x*360} cy={p.y*280} r="9" fill="#cf9e6a" fillOpacity=".2" stroke="#bd915f"/>)}</>}
 </svg></section><ArrowRight className="demo-stage-arrow" size={20}/><section className="interaction-result"><h3>{t(learned&&!ready?'训练示范':'输出结果')}</h3>
 {kind==='pose'?<div className="demo-category-list">{labels.map(label=><div key={label} className={d.category===label&&d.phase!=='train'?'is-selected':''}><span>{t(label)}</span><small>{t(ready?(d.category===label?'当前姿态':'等待此姿态'):(d.category===label?'录制示范':'另一种姿态'))}</small>{ready&&d.category===label&&<Check size={17}/>}</div>)}</div>:
 kind==='continuous'?<div className="demo-value"><strong>{d.value.toFixed(2)}</strong><div className="demo-value-meter"><i style={{width:d.value*100+'%'}}/></div><div><span>0 · {t(labels[0])}</span><span>1 · {t(labels[1])}</span></div><small>{t(ready?(mode==='pose'?'下蹲程度连续变化':'张开程度连续变化'):'先给两个姿态指定数值')}</small></div>:
 kind==='coordinates'?<div className="demo-coordinate-result"><svg viewBox="0 0 240 150" aria-label={t('坐标控制位置')}><path d="M 16 14 V 134 H 224" fill="none" stroke="#b9c9d6"/>{[.25,.5,.75].map(x=><path key={x} d={`M ${16+x*208} 14 V 134 M 16 ${14+x*120} H 224`} stroke="#e0e8ef"/>)}<circle cx={16+tip.x*208} cy={14+tip.y*120} r="8" fill="#5685ad"/>{dual&&<circle cx={16+second.x*208} cy={14+second.y*120} r="8" fill="#b88750"/>}</svg><div className="demo-coordinate-values"><span>{t(mode==='face'?'鼻尖':mode==='pose'?'左手腕':dual?'左手食指尖':'食指尖')}</span><code>X {tip.x.toFixed(2)} · Y {tip.y.toFixed(2)}</code>{dual&&<><span>{t('右手食指尖')}</span><code>X {second.x.toFixed(2)} · Y {second.y.toFixed(2)}</code></>}</div></div>:
 <div className={'demo-rule-result '+(d.triggered?'is-fired':'')}><div className="demo-rule-light"><Check size={32}/></div><strong>{t(d.triggered?'触发一次':d.hold>0?'保持中…':'等待条件成立')}</strong><div className="demo-value-meter"><i style={{width:d.hold*100+'%'}}/></div><small>{t('保持 {0} 秒 · 示意',demoRuleSeconds(kind))}</small></div>}
 </section></div>
 <div className="demo-caption"><span>{t(kind==='coordinates'&&dual?'示例：两只手各控制一个圆，按手独立输出。':kind==='coordinates'?(mode==='hand'?'示例：食指尖控制圆的位置，可自行增加点和坐标轴。':mode==='face'?'示例：鼻尖控制圆的位置，可自行选择其他面部点。':'示例：左手腕控制圆的位置，可自行选择其他身体点。'):kind==='pose'?'保持姿态即可识别，不必重复一整段动作。':kind==='continuous'?'中间姿态输出中间数值。':status)}</span>{learned&&<span className="demo-training-steps">{['录制','训练','运行'].map((s,i)=><span key={s} className={i===(d.phase==='record'?0:d.phase==='train'?1:2)?'is-current':''}>{i+1} {t(s)}</span>)}</span>}{exampleSettingsDiffer&&<span className="demo-settings-note">{t('此为入门示例；当前项目使用其他规则或参数。')}</span>}</div>
 <div className="demo-playback"><button className="text-button" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause size={14}/>:<Play size={14}/>} {t(playing?'暂停动画':'播放动画')}</button><button className="text-button" onClick={()=>{elapsed.current=0;setTime(0);setReplay(v=>v+1);setPlaying(true);}}><RotateCcw size={14}/>{t('重新看一遍')}</button></div></div>
 <footer><button ref={confirm} className="primary" onClick={onClose}>{t('确定')}<Check size={16}/></button></footer></dialog>;
}
