import {useEffect,useRef,useState} from 'react';
import type {CoordinateHandOptions} from './coordinate-hands';
import type {Mode,Point} from './core';
import {prepareCameraAssets,initializeCameraTask} from './camera-assets';
import {t,messageT} from './i18n';
import {createCoordinateDetector} from './coordinate-detector';

export function useLandmarkCamera(mode:Mode,onPoints:(points:Point[])=>void,handOptions?:CoordinateHandOptions) {
  const options=useRef(handOptions);options.current=handOptions;
  const video=useRef<HTMLVideoElement>(null);
  const callback=useRef(onPoints);callback.current=onPoints;
  const stream=useRef<MediaStream|null>(null);
  const controller=useRef<AbortController|null>(null);
  const detector=useRef<Awaited<ReturnType<typeof createCoordinateDetector>>|null>(null);
  const epoch=useRef(0),raf=useRef(0),busy=useRef(false),sentAt=useRef(0);
  const videoTime=useRef(-1),freshAt=useRef(0);
  const [state,setState]=useState<'off'|'opening'|'on'>('off');
  const [startupStatus,setStartupStatus]=useState('');
  const [error,setError]=useState('');
  const [fallback,setFallback]=useState(false);
  const [size,setSize]=useState({width:1280,height:720});
  function stop() {
    epoch.current++;cancelAnimationFrame(raf.current);
    controller.current?.abort();controller.current=null;
    detector.current?.close();detector.current=null;
    stream.current?.getTracks().forEach(track=>{track.onended=null;track.stop();});stream.current=null;
    busy.current=false;sentAt.current=0;videoTime.current=-1;freshAt.current=0;
    if(video.current)video.current.srcObject=null;
    setState('off');setStartupStatus('');setFallback(false);callback.current([]);
  }
  async function start() {
    stop();setError('');setState('opening');
    const generation=epoch.current;
    let phase:'camera'|'model'='camera';
    let preloaded:Awaited<ReturnType<typeof prepareCameraAssets>>|undefined;
    setStartupStatus(t('等待摄像头权限'));
    try {
      const media=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720},aspectRatio:{ideal:16/9},facingMode:'user'},audio:false});
      if(generation!==epoch.current){media.getTracks().forEach(track=>track.stop());return;}
      stream.current=media;
      media.getTracks().forEach(track=>track.onended=()=>{if(generation===epoch.current){stop();setError('摄像头连接已中断。');}});
      const abort=new AbortController();controller.current=abort;
      const element=video.current!;
      element.srcObject=media;
      setStartupStatus(t('正在等待摄像头画面'));
      await initializeCameraTask(element.play(),abort.signal,undefined,'摄像头没有开始播放，请关闭其他占用摄像头的应用后重试。');
      if(generation!==epoch.current)return;
      setSize({width:element.videoWidth||1280,height:element.videoHeight||720});
      phase='model';
      const base=new URL(import.meta.env.BASE_URL,location.href).href;
      setStartupStatus(t('正在准备检测'));
      preloaded=await prepareCameraAssets(mode,base,abort,bytes=>{
        if(generation===epoch.current)setStartupStatus(bytes===0?t('正在下载检测模型'):t('正在下载检测模型 · 已下载 {0} MB',(bytes/1_000_000).toFixed(1)));
      });
      abort.signal.throwIfAborted();
      setStartupStatus(t('正在初始化检测'));
      const active=await createCoordinateDetector(mode,base,abort.signal,handOptions,preloaded);
      if(generation!==epoch.current){active.close();return;}
      detector.current=active;setFallback(active.fallback);setState('on');
      async function tick(now:number) {
        if(generation!==epoch.current)return;
        raf.current=requestAnimationFrame(tick);
        if(busy.current){if(now-sentAt.current>350)callback.current([]);return;}
        if(now-sentAt.current<66||!video.current||video.current.readyState<2)return;
        if(video.current.currentTime===videoTime.current){
          if(now-freshAt.current>350)callback.current([]);
          return;
        }
        videoTime.current=video.current.currentTime;freshAt.current=now;
        const requested={handMode:options.current?.handMode,hand:options.current?.hand};
        busy.current=true;sentAt.current=now;
        try {
          const points=await active.detect(video.current,now,requested);
          if(generation===epoch.current){
            const changed=requested.handMode!==options.current?.handMode||requested.hand!==options.current?.hand;
            callback.current(changed||performance.now()-now>350?[]:points);
          }
        } catch {
          if(generation===epoch.current){stop();setError('检测模型加载失败，请重新开启摄像头。');}
        } finally {if(generation===epoch.current)busy.current=false;}
      }
      raf.current=requestAnimationFrame(tick);
    } catch(e) {
      if(generation===epoch.current){
        stop();
        setError(phase==='model'&&e instanceof Error?messageT(e.message):'无法开启摄像头，请检查设备与权限。');
      }
    }finally{preloaded?.release();}
  }
  useEffect(()=>{
    const hidden=()=>{if(document.hidden)stop();};
    document.addEventListener('visibilitychange',hidden);window.addEventListener('motion-stop',stop);
    return ()=>{stop();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('motion-stop',stop);};
  },[mode]);
  return {video,state,error,size,start,stop,fallback,startupStatus,clearError:()=>setError('')};
}
