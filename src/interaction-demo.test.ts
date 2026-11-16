import test from 'node:test';import assert from 'node:assert/strict';
import {handDemo,HAND_DEMOS,illustratedHand,type HandDemoKind} from './interaction-demo';
import {extract} from './core';
import {relationFrame,relationValue} from './relation';
import {MEDIA_DEMOS} from './MediaInteractionGuide';
import en from './locales/en.json';
test('all eleven guide titles, captions and example targets have English text',()=>{
 const dictionary=en as Record<string,string>;
 for(const meta of [...Object.values(HAND_DEMOS),...Object.values(MEDIA_DEMOS)])for(const text of Object.values(meta))assert.ok(dictionary[text],text);
 for(const text of ['录制','训练','运行','开启摄像头后可对照','检测到目标后可对照','录制结束后可对照','检测到目标','未检测到目标','杯子数量','剪刀'])assert.ok(dictionary[text],text);
});
test('all five illustrations have finite 21-point inputs across a full loop',()=>{
 for(const kind of Object.keys(HAND_DEMOS) as HandDemoKind[])for(let time=0;time<24000;time+=50){const s=handDemo(kind,time);assert.equal(s.points.length,21);assert.ok(s.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));assert.ok(s.value>=0&&s.value<=1);assert.ok(s.hold>=0&&s.hold<=1);}
});
test('pose and continuous illustrations show separate examples before training and live use',()=>{
 for(const kind of ['pose','continuous'] as const){assert.equal(handDemo(kind,500).phase,'record');assert.equal(handDemo(kind,2200).openness,1);assert.equal(handDemo(kind,3900).phase,'train');assert.equal(handDemo(kind,5000).phase,'run');}
 assert.equal(handDemo('pose',5000).category,'握拳');assert.equal(handDemo('pose',10000).category,'张掌');
 const a=extract('hand',illustratedHand(0))!,b=extract('hand',illustratedHand(1))!;assert.ok(a.shape.some((v,i)=>Math.abs(v-b.shape[i])>.1));
});
test('region and pinch show waiting, held trigger and release rather than repeated pulses',()=>{
 for(const kind of ['region','relation'] as const){assert.equal(handDemo(kind,0).hold,0);assert.equal(handDemo(kind,4800).triggered,true);assert.equal(handDemo(kind,6500).triggered,true);assert.equal(handDemo(kind,11500).triggered,false);}
 for(let time=0;time<12000;time+=40){const s=handDemo('region',time);if(s.hold>0)assert.ok(s.tip.x>=.56&&s.tip.x<=.78&&s.tip.y>=.23&&s.tip.y<=.51);}
 const close=handDemo('relation',4800),open=handDemo('relation',0);
 const config={points:[4,8] as [number,number],rule:'distance' as const,threshold:.3,seconds:.8};
 assert.equal(relationValue('hand',relationFrame('hand',close.points),config),true);assert.equal(relationValue('hand',relationFrame('hand',open.points),config),false);
});
test('coordinate illustration values are exactly the selected fingertip, continuously moving in range',()=>{
 const seen=new Set();for(let time=0;time<12000;time+=80){const s=handDemo('coordinates',time);assert.deepEqual(s.tip,s.points[8]);assert.ok(s.tip.x>=0&&s.tip.x<=1&&s.tip.y>=0&&s.tip.y<=1);seen.add(s.tip.x.toFixed(2));}assert.ok(seen.size>30);
});
