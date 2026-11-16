import test from 'node:test';import assert from 'node:assert/strict';import {applyHandPath,changeHandPath} from './hand-path';import{demoHand}from'./feature-demo';import{extract,validateProject,type Project}from'./core';import{changeFocus}from'./focus';import{deleteBatch}from'./batch-delete';
import {demoHandReference} from './feature-demo';
test('guide path marker uses the same palm, wrist or index reference as actual output features',()=>{
 for(const path of ['palm','wrist','index'] as const)for(const p of [0,.2,.5,.9,1]){
  const points=demoHand('both',p),frame=extract('hand',points)!;
  const marker=demoHandReference(points,path),actual=applyHandPath(frame,path).root;
  assert.deepEqual([marker.x,marker.y],actual);
 }
});
const f=(p:number)=>extract('hand',demoHand('shape',p),[],p*1000)!;
const project=():Project=>({schemaVersion:1,name:'test',mode:'hand',feature:'path',handPath:'palm',recommendedFeature:'shape',updatedAt:'2026',actions:[{id:'a',name:'a',effect:'indicator',color:'#dddddd',trained:true,threshold:.7,samples:[{id:'s',negative:false,duration:1000,frames:Array.from({length:11},(_,i)=>f(i/10))}]}]});
test('palm path excludes fingertip changes, and index path follows index point',()=>{assert.deepEqual(applyHandPath(f(0),'palm').root,applyHandPath(f(1),'palm').root);assert.deepEqual(applyHandPath(f(1),'index').root,[f(1).points[8].x,f(1).points[8].y]);const legacy=f(0);assert.equal(applyHandPath(legacy),legacy);});
test('focus and path are independent; explicit change retains raw samples, invalidates training',()=>{const p=project(),points=JSON.stringify(p.actions[0].samples[0].frames.map(f=>f.points));const next=changeFocus(p,[4,8]);assert.deepEqual(next.actions[0].samples[0].frames[1].root,applyHandPath(f(1),'palm').root);const changed=changeHandPath(p,'index');assert.equal(changed.actions[0].trained,false);assert.equal(JSON.stringify(changed.actions[0].samples[0].frames.map(f=>f.points)),points);assert.equal(p.actions[0].trained,true);});
test('new metadata round-trips; legacy root survives absent policy; invalid config is rejected',()=>{const p=validateProject(JSON.parse(JSON.stringify(project())));assert.equal(p.handPath,'palm');assert.equal(p.recommendedFeature,'shape');const old=project();delete old.handPath;delete old.recommendedFeature;const copy=validateProject(JSON.parse(JSON.stringify(old)));assert.deepEqual(copy.actions[0].samples,old.actions[0].samples);assert.throws(()=>validateProject({...p,handPath:'anything'}));});
test('batch deletion uses captured IDs only, deduplicates, and reports partial failures',async()=>{const seen:string[]=[];const failed=await deleteBatch(['a','b','a',''],async id=>{seen.push(id);if(id==='b')throw Error();});assert.deepEqual(seen,['a','b']);assert.deepEqual(failed,['b','']);});
