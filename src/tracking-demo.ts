import {buildDemoRuleTimeline,demoRuleTime,demoRuleSeconds,DEMO_RULE_STEP} from './demo-rule';
import {newRelationRule} from './tracking-presets';
import {relationFrame,relationValue} from './relation';
import type {FeatureMode,Mode,Point} from './core';
import {handDemo,HAND_DEMOS,type HandDemoKind} from './interaction-demo';
import {FEATURE_EXAMPLES} from './feature-demo';
export type FigureMode='face'|'pose';
const smooth=(p:number)=>{const v=Math.max(0,Math.min(1,p));return v*v*(3-2*v);};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const TRACKING_DEMOS:Record<FigureMode,typeof HAND_DEMOS>={
 face:{
  pose:{title:'区分张嘴和闭嘴',caption:'为闭嘴和张嘴各建一个动作，分别录制、训练，再识别当前表情。'},
  continuous:{title:'嘴张得越大，数值越大',caption:'分别录制闭嘴的 0 和张嘴的 1，训练后用张嘴程度控制数值。'},
  region:{title:'鼻尖在区域内停留',caption:'选择鼻尖并设置区域；停留达标后触发，移出后可再次触发。'},
  relation:{title:'上下唇靠近',caption:'选择上下唇并设置距离；闭嘴保持达标后触发，张嘴后可再次触发。'},
  coordinates:{title:'直接输出面部坐标',caption:'选择面部检测点和坐标轴，位置持续变成数值，无需录制或训练。'}
 },
 pose:{
  pose:{title:'区分站立和下蹲',caption:'为站立和下蹲各建一个动作，分别录制、训练，再识别当前姿态。'},
  continuous:{title:'蹲得越低，数值越大',caption:'分别录制站立的 0 和下蹲的 1，训练后用下蹲程度控制数值。'},
  region:{title:'手腕在区域内停留',caption:'选择一个手腕并设置区域；停留达标后触发，移出后可再次触发。'},
  relation:{title:'手腕高于肩膀',caption:'双手腕高于肩膀并保持达标后触发，放下后可再次触发。'},
  coordinates:{title:'直接输出身体坐标',caption:'选择身体检测点和坐标轴，位置持续变成数值，无需录制或训练。'}
 }
};
export const trackingLabels=(mode:Mode)=>mode==='hand'?['握拳','张掌']:mode==='face'?['闭嘴','张嘴']:['站立','下蹲'];
export function demoFace(open:number,dx=0,dy=0):Point[]{
 const ps=Array.from({length:478},(_,i)=>({x:.5+Math.sin(i*.37)*.17,y:.48+Math.cos(i*.37)*.28}));
 const marks:Record<number,[number,number]>={1:[.5,.5],4:[.5,.54],10:[.5,.15],152:[.5,.81+open*.04],33:[.37,.4],133:[.45,.4],263:[.63,.4],362:[.55,.4],159:[.41,.385],145:[.41,.415],386:[.59,.385],374:[.59,.415],61:[.43-open*.008,.62+open*.01],291:[.57+open*.008,.62+open*.01],13:[.5,.615-open*.025],14:[.5,.625+open*.045]};
 for(const [id,p] of Object.entries(marks))ps[+id]={x:p[0],y:p[1]};
 return ps.map(p=>({...p,x:p.x+dx,y:p.y+dy}));
}
export function demoBody(squat:number,arms=0,dx=0,dy=0):Point[]{
 const ps:Point[]=Array.from({length:33},()=>({x:.5,y:.2,visibility:1}));const q=squat*.18;
 const marks:Record<number,[number,number]>={0:[.5,.13+q],1:[.48,.115+q],2:[.475,.115+q],3:[.47,.115+q],4:[.52,.115+q],5:[.525,.115+q],6:[.53,.115+q],7:[.45,.13+q],8:[.55,.13+q],9:[.48,.15+q],10:[.52,.15+q],11:[.4,.29+q],12:[.6,.29+q],13:[.32,.46+q-arms*.23],14:[.68,.46+q-arms*.23],15:[.28,.59+q-arms*.47],16:[.72,.59+q-arms*.47],23:[.44,.57+q],24:[.56,.57+q],25:[.43-squat*.1,.75+squat*.06],26:[.57+squat*.1,.75+squat*.06],27:[.43,.93],28:[.57,.93],29:[.43,.94],30:[.57,.94],31:[.38,.96],32:[.62,.96]};
 for(const [id,p] of Object.entries(marks))ps[+id]={x:p[0],y:p[1],visibility:1};
 for(const [id,parent] of [[17,15],[19,15],[21,15],[18,16],[20,16],[22,16]])ps[id]={...ps[parent]};
 return ps.map(p=>({...p,x:p.x+dx,y:p.y+dy}));
}
export function trackingExamples(mode:Mode){return mode==='hand'?FEATURE_EXAMPLES:mode==='face'?{
 path:{title:'只看整体轨迹',example:'表情不变，头部左右移动',watch:'看头部往哪里移动'},
 shape:{title:'只看局部形变',example:'原地张嘴，再闭嘴',watch:'看面部表情怎样变化'},
 both:{title:'形变 + 整体轨迹',example:'一边移动头部，一边张嘴',watch:'同时看头部移动与表情变化'}
 }:{
 path:{title:'只看整体轨迹',example:'姿态不变，身体左右移动',watch:'看身体中心往哪里移动'},
 shape:{title:'只看局部形变',example:'原地抬起，再放下手臂',watch:'看身体关节怎样变化'},
 both:{title:'形变 + 整体轨迹',example:'一边移动，一边抬起手臂',watch:'同时看身体移动与关节变化'}
 };}
export function trackingDynamic(mode:FigureMode,feature:FeatureMode,p:number,repeat=false){
 const shape=feature==='path'?0:Math.sin(clamp(p)*Math.PI)**2;
 const dx=(feature==='shape'?0:feature==='path'?Math.sin(p*Math.PI*2)*.12:-.12+p*.24)+(repeat&&feature==='shape'?.045:0);
 return mode==='face'?demoFace(shape,dx):demoBody(0,shape,dx);
}
const riseAt=(p:number)=>smooth((p-.08)/.2)*(1-smooth((p-.76)/.17));

function trackingRaw(mode:FigureMode,kind:HandDemoKind,time:number){
 const ms=Math.max(0,time)%12000,p=ms/12000,learned=kind==='pose'||kind==='continuous';
 const phase=learned?(ms<3400?'record':ms<4400?'train':'run'):'run',run=Math.max(0,(ms-4400)/7600);
 const value=learned?(phase==='record'?(ms<1700?0:1):phase==='train'?1:kind==='pose'?(run<.5?0:1):.5-.5*Math.cos(run*Math.PI*2)):0;
 let points=mode==='face'?demoFace(value):demoBody(value);
 const region=mode==='face'?{x:.56,y:.28,width:.22,height:.25}:{x:.18,y:.06,width:.18,height:.2};
 const pointId=mode==='face'?1:15,markerIds=mode==='face'?[13,14]:[15,16];
 if(kind==='region'){
  const rise=riseAt(p);
  if(mode==='face')points=demoFace(0,-.26+.42*rise,-.1);
  else {points=demoBody(0);points[15]={x:.28,y:.59-.47*rise,visibility:1};points[13]={x:.32,y:.46-.23*rise,visibility:1};}

 }
 if(kind==='relation'){
  const close=riseAt(p);points=mode==='face'?demoFace(1-close):demoBody(0,close);

 }
 if(kind==='coordinates'){
  if(mode==='face')points=demoFace(0,.12*Math.sin(p*Math.PI*2),.08*Math.cos(p*Math.PI*2));
  else {points=demoBody(0);points[15]={x:.28+.08*Math.sin(p*Math.PI*2),y:.4-.2*Math.cos(p*Math.PI*2),visibility:1};points[13]={x:(.4+points[15].x)/2-.04,y:(.29+points[15].y)/2+.05,visibility:1};}
 }
 return {points,phase,openness:value,value,category:trackingLabels(mode)[value<.5?0:1],tip:points[pointId],region,markerIds:kind==='relation'?markerIds:[pointId]};
}

const figureTimelines=new Map<string,ReturnType<typeof buildDemoRuleTimeline>>();
export function trackingInteraction(mode:Mode,kind:HandDemoKind,time:number){
 if(mode==='hand')return {...handDemo(kind,time),region:{x:.56,y:.23,width:.22,height:.28},markerIds:[8,4]};
 const isRule=kind==='region'||kind==='relation',at=isRule?demoRuleTime(time):time,d=trackingRaw(mode,kind,at);
 if(!isRule)return {...d,hold:0,triggered:false};
 const key=mode+':'+kind;
 if(!figureTimelines.has(key))figureTimelines.set(key,buildDemoRuleTimeline(t=>{
  const f=trackingRaw(mode,kind,t);return kind==='region'?f.tip.x>=f.region.x&&f.tip.x<=f.region.x+f.region.width&&f.tip.y>=f.region.y&&f.tip.y<=f.region.y+f.region.height:
   relationValue(mode,relationFrame(mode,f.points),newRelationRule(mode))===true;
 },demoRuleSeconds(kind)));
 return {...d,...figureTimelines.get(key)![at/DEMO_RULE_STEP]};
}
