import type {Frame,Project} from './core';
export type HandPath='palm'|'index'|'wrist';
export function applyHandPath(frame:Frame,path?:HandPath):Frame{if(!path)return frame;const ids=path==='palm'?[0,5,9,13,17]:path==='index'?[8]:[0];if(ids.some(i=>!frame.points[i]||!Number.isFinite(frame.points[i].x)||!Number.isFinite(frame.points[i].y)))throw Error('轨迹参考点不完整。');return {...frame,root:[ids.reduce((n,i)=>n+frame.points[i].x,0)/ids.length,ids.reduce((n,i)=>n+frame.points[i].y,0)/ids.length]};}
export function changeHandPath(project:Project,path:HandPath):Project{return {...project,handPath:path,actions:project.actions.map(a=>({...a,trained:false,samples:a.samples.map(s=>({...s,frames:s.frames.map(f=>applyHandPath(f,path))}))}))};}
