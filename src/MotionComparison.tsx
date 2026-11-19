import {comparisonLabel} from './feature-demo';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Layers,Play,Pause,X} from 'lucide-react';
import {t} from './i18n';
import type {Action,FeatureMode,Frame,Mode,Sample} from './core';
import {containBox} from './preview';
import {alignFrames,ComparisonCapture,comparisonPointIds,comparisonSamples,shapeOverlayFrame,frameAt,traceSegments} from './motion-comparison';

function Drawing({frames,frame,feature,color,dashed=false,fade=false,lostBefore,focus,mode,now}:{frames:Frame[];frame:Frame|null;feature:FeatureMode;color:string;dashed?:boolean;fade?:boolean;lostBefore?:number[];focus?:number[];mode:Mode;now?:number}){
 const last=frames.at(-1)?.t??0;const fadeAt=(time:number)=>fade?Math.max(0,1-((now??last)-time)/1500):1;
 const ids=comparisonPointIds(mode,focus);
 const chains=mode==='hand'?[[0,1,2,3,4],[0,5,6,7,8],[5,9,10,11,12],[9,13,14,15,16],[13,17,18,19,20],[0,17]]:mode==='pose'?[[11,12,24,23,11],[11,13,15],[12,14,16],[23,25,27],[24,26,28]]:[[33,133],[263,362],[61,13,291,14,61],[1,4],[10,152]];
 const visible=(id:number)=>!!frame?.points[id]&&ids.includes(id)&&(mode!=='pose'||(frame.points[id].visibility??1)>=.45);
 return <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed?'6 6':undefined}>
 {feature!=='shape'&&traceSegments(frames,lostBefore).flatMap((part,k)=>part.slice(1).map((f,i)=><line key={k+'-'+i} x1={part[i].root[0]*1000} y1={part[i].root[1]*750} x2={f.root[0]*1000} y2={f.root[1]*750} opacity={fade?fadeAt(f.t):.65}/>))}
 {feature!=='shape'&&frames[0]&&<circle cx={frames[0].root[0]*1000} cy={frames[0].root[1]*750} r="4" opacity={.6*fadeAt(frames[0].t)}/>}
 {feature!=='path'&&frame&&<g opacity={(dashed?.75:.9)*fadeAt(frame.t)}>{chains.flatMap((chain,k)=>chain.slice(1).map((id,i)=>visible(chain[i])&&visible(id)?<line key={k+'-'+i} x1={frame.points[chain[i]].x*1000} y1={frame.points[chain[i]].y*750} x2={frame.points[id].x*1000} y2={frame.points[id].y*750}/>:null))}{ids.map(id=>visible(id)?<circle key={id} cx={frame.points[id].x*1000} cy={frame.points[id].y*750} r="3"/>:null)}</g>}
 {feature==='path'&&frame&&<circle cx={frame.root[0]*1000} cy={frame.root[1]*750} r="5" opacity={fadeAt(frame.t)} fill={color} stroke="white" strokeWidth="1.5"/>}
 </g>;
}
function CompareDialog({sample,current,mode,feature,focus,onClose}:{sample:Sample;current:Frame[];mode:Mode;feature:FeatureMode;focus?:number[];onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const [playing,setPlaying]=useState(true),[progress,setProgress]=useState(0);
 const position=useRef(0);const reference=useMemo(()=>alignFrames(sample.frames,feature),[sample.frames,feature]),live=useMemo(()=>alignFrames(current,feature),[current,feature]);
 const viewBox=useMemo(()=>{ const ids=comparisonPointIds(mode,focus);const coordinates=[...reference,...live].flatMap(f=>[f.root,...(feature==='path'?[]:ids.flatMap(id=>f.points[id]?[[f.points[id].x,f.points[id].y] as [number,number]]:[]))]);
 const xs=coordinates.map(p=>p[0]*1000),ys=coordinates.map(p=>p[1]*750);const minX=xs.reduce((a,b)=>Math.min(a,b),Infinity),maxX=xs.reduce((a,b)=>Math.max(a,b),-Infinity),minY=ys.reduce((a,b)=>Math.min(a,b),Infinity),maxY=ys.reduce((a,b)=>Math.max(a,b),-Infinity);const w=Math.max(650,maxX-minX+100,(maxY-minY+100)*4/3),h=w*3/4;return `${(minX+maxX-w)/2} ${(minY+maxY-h)/2} ${w} ${h}`;
 },[reference,live,mode,focus,feature]);
 useEffect(()=>{const d=dialog.current!;d.showModal();return()=>d.close();},[]);
 useEffect(()=>{if(!playing)return;let id=0;const duration=Math.max(500,sample.duration,current.length>1?current.at(-1)!.t-current[0].t:0),start=performance.now()-position.current*duration;const tick=(now:number)=>{const p=Math.min(1,(now-start)/duration);position.current=p;setProgress(p);if(p<1)id=requestAnimationFrame(tick);else setPlaying(false);};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[playing,sample,current]);
 return <dialog ref={dialog} className="motion-compare-dialog" aria-labelledby="motion-compare-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
 <header><div><h2 id="motion-compare-title">{t(current.length?'动作对照':'示范回放')}</h2><p>{t(current.length?'起点与尺寸已对齐，按动作进度同步播放。':'按原录制进度播放关键点。')}</p></div><button className="icon-button" aria-label={t('关闭对照窗口')} onClick={onClose}><X size={18}/></button></header>
 <div className="motion-compare-stage"><svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-label={t('示范与当前动作对照')}><Drawing frames={reference} frame={frameAt(reference,progress)} feature={feature} color="#6e8397" dashed lostBefore={sample.lostBefore} mode={mode} focus={focus}/>{current.length>0&&<Drawing frames={live.filter(f=>f.t<=(frameAt(live,progress)?.t??0))} frame={frameAt(live,progress)} feature={feature} color="#447eac" mode={mode} focus={focus}/>}</svg></div>
 <div className="motion-legend"><span><i className="reference"/>{t('训练示范')} · {(sample.duration/1000).toFixed(2)} s</span>{current.length>0&&<span><i/>{t('刚才的动作')} · {((current.length>1?current.at(-1)!.t-current[0].t:0)/1000).toFixed(2)} s</span>}</div>
 <div className="motion-playback"><button className="secondary small" onClick={()=>{if(progress>=1){position.current=0;setProgress(0);}setPlaying(v=>!v);}}>{playing?<Pause size={14}/>:<Play size={14}/>} {t(playing?'暂停':'播放')}</button><input aria-label={t('对照播放进度')} type="range" min="0" max="1" step=".001" value={progress} onChange={e=>{setPlaying(false);position.current=+e.target.value;setProgress(+e.target.value);}}/></div>
 <p className="motion-footnote">{t('用于观察动作差异，不代表识别评分；回放本身不发送输出。')}</p></dialog>;
}
export function MotionComparison({action,mode,feature,frame,camera,headingRef,stage,sourceSize,focus,recording,onOpenChange,handPath}:{action:Action;mode:Mode;feature:FeatureMode;frame:Frame|null;camera:boolean;headingRef:React.RefObject<HTMLDivElement>;stage:React.RefObject<HTMLDivElement>;sourceSize:{width:number;height:number};focus?:number[];recording:boolean;handPath?:'palm'|'index'|'wrist';onOpenChange?:(open:boolean)=>void}){
 const [open,setOpen]=useState(false),[chosen,setChosen]=useState('latest'),[trail,setTrail]=useState(true),[playing,setPlaying]=useState(false),[progress,setProgress]=useState(0),[review,setReview]=useState<{sample:Sample;current:Frame[]}|null>(null);
 useEffect(()=>{onOpenChange?.(open);return()=>onOpenChange?.(false);},[open,onOpenChange]);
 const playbackPosition=useRef(0);const focusKey=focus?.join(',')??'';
 const capture=useRef(new ComparisonCapture());const [recent,setRecent]=useState<Frame[]>([]);const [frozen,setFrozen]=useState<Frame[]>([]);
 const samples=comparisonSamples(action),selected=samples.find(v=>v.sample.id===chosen)??samples[0],sample=selected?.sample;
 const [heading,setHeading]=useState<HTMLDivElement|null>(null);
 useEffect(()=>setHeading(headingRef.current),[headingRef]);
 const [box,setBox]=useState({left:0,top:0,width:0,height:0});const [target,setTarget]=useState<HTMLElement|null>(null);
 useEffect(()=>{const el=stage.current;if(!el)return;setTarget(el.querySelector<HTMLElement>('.camera-content'));const resize=()=>setBox(containBox(el.clientWidth,el.clientHeight,sourceSize.width,sourceSize.height));resize();const observer=new ResizeObserver(resize);observer.observe(el);return()=>observer.disconnect();},[stage,sourceSize.width,sourceSize.height]);
 useEffect(()=>{capture.current.reset(performance.now());setRecent([]);setFrozen([]);setPlaying(false);setProgress(0);setReview(null);},[action.id,feature,focusKey,handPath]);
 useEffect(()=>{if(!camera)setFrozen(capture.current.snapshot());else setFrozen([]);capture.current.reset(performance.now());setRecent([]);setPlaying(false);},[camera]);
 useEffect(()=>{if(!open||!camera||recording)return;if(!frame){capture.current.lose();setRecent([]);return;}if(capture.current.append(frame,sample?.duration??3000)){setFrozen([]);setRecent(capture.current.trail(performance.now()));}},[frame,open,camera,recording,sample?.duration]);
 useEffect(()=>{if(!open)return;const id=window.setInterval(()=>setRecent(capture.current.trail(performance.now())),100);return()=>clearInterval(id);},[open]);
 useEffect(()=>{capture.current.reset(performance.now());setRecent([]);setFrozen([]);setPlaying(false);},[recording]);
 useEffect(()=>{setPlaying(false);setProgress(0);playbackPosition.current=0;},[sample]);
 useEffect(()=>{if(chosen!=='latest'&&!action.samples.some(s=>s.id===chosen&&!s.negative&&s.split!=='test'))setChosen('latest');},[action.samples,chosen]);
 useEffect(()=>{if(!playing||!sample)return;let id=0;const start=performance.now()-playbackPosition.current*Math.max(500,sample.duration);const tick=(now:number)=>{const p=Math.min(1,(now-start)/Math.max(500,sample.duration));playbackPosition.current=p;setProgress(p);if(p<1)id=requestAnimationFrame(tick);else setPlaying(false);};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[playing,sample]);
 const current=recent.at(-1)??null;
 const available=capture.current.snapshot(sample?.duration??3000);const frames=available.length>=2?available:frozen;
 const canReview=!recording&&!!sample&&frames.length>=2;
 const toggle=<button type="button" className="text-button motion-toggle" aria-expanded={open} onClick={()=>{setOpen(v=>!v);setPlaying(false);capture.current.reset(performance.now());setRecent([]);setFrozen([]);}}><Layers size={14}/>{t(open?'关闭动作对照':'动作对照')}</button>;
 return <>{heading&&createPortal(toggle,heading)}<div className="motion-comparison" hidden={!open}>
 {open&&<div className="motion-controls"><label className="motion-reference"><span>{t(feature==='path'&&mode==='hand'&&handPath?t(handPath==='palm'?'掌心移动轨迹':handPath==='index'?'食指尖轨迹':'手腕移动轨迹'):comparisonLabel(mode,feature,!!focus))}</span><select aria-label={t('对照示范')} disabled={!samples.length} value={samples.some(v=>v.sample.id===chosen)?chosen:'latest'} onChange={e=>{setChosen(e.target.value);setPlaying(false);setProgress(0);}}><option value="latest">{sample?t('最新 · 第 {0} 次录制',samples[0].number):t('暂无训练示范')}</option>{samples.filter(v=>v.sample.id!==samples[0]?.sample.id||chosen===v.sample.id).map(v=><option key={v.sample.id} value={v.sample.id}>{t('第 {0} 次录制',v.number)}</option>)}</select></label><label className="motion-trail"><input type="checkbox" checked={trail} onChange={e=>setTrail(e.target.checked)}/>{t('实时留痕')}</label><button className="motion-action" disabled={!sample||recording} onClick={()=>{if(!camera||!current){setReview({sample:sample!,current:[]});return;}if(playbackPosition.current>=1){playbackPosition.current=0;setProgress(0);}setPlaying(v=>!v);}}>{playing?<Pause size={13}/>:<Play size={13}/>} {t(playing?'暂停':'回放示范')}</button><button className="motion-action" disabled={!canReview} onClick={()=>{if(canReview)setReview({sample:sample!,current:frames.slice()});}}>{t(recording?'录制结束后可对照':canReview?'查看这次对照':!sample?'先录制训练示范':!camera?'开启摄像头后可对照':!current?'检测到目标后可对照':'做一次动作后可对照')}</button><div className="motion-legend"><span><i className="reference"/>{t('参考示范')}</span><span><i/>{t('实时动作')}</span></div>{!sample&&<small>{t('录制一条正向训练示范后即可对照。')}</small>}</div>}
 {open&&camera&&target&&createPortal(<svg className="motion-overlay" style={box} viewBox="0 0 1000 750" preserveAspectRatio="none" aria-label={t('动作对照叠加层')}>{sample&&<Drawing frames={sample.frames} frame={feature==='shape'?(current?shapeOverlayFrame(mode,frameAt(sample.frames,progress)!,current):null):frameAt(sample.frames,progress)} feature={feature} color="#d1dbe4" dashed mode={mode} focus={focus} lostBefore={sample.lostBefore}/ >}{trail&&<Drawing frames={recent} frame={current} feature={feature} color="#67b5ed" fade now={performance.now()} mode={mode} focus={focus}/>}</svg>,target)}
 {review&&<CompareDialog sample={review.sample} current={review.current} mode={mode} feature={feature} focus={focus} onClose={()=>setReview(null)}/>}
 </div></>;
}
