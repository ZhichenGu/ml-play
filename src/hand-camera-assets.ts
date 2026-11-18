// Bump with changes to the hand model or its WASM runtime, independently of UI releases.
export const HAND_CAMERA_ASSET_REVISION='0.109';
const assetCacheName='platform-hand-camera-'+HAND_CAMERA_ASSET_REVISION;
const memoryAssets=new Map<string,Blob>();

export type HandCameraAssets = {
  files: {wasmLoaderPath:string;wasmBinaryPath:string};
  modelPath:string;
};

export async function fetchHandCameraAssets(
  files:HandCameraAssets['files'], modelPath:string, controller:AbortController,
  onDownload:(bytes:number)=>void,
) {
  const {signal}=controller;
  const loaded=[0,0,0];
  let lastReport=0;
  let downloading=false;
  const cache=await globalThis.caches?.open(assetCacheName).catch(()=>undefined);
  signal.throwIfAborted();
  async function downloadOnce(url:string,index:number) {
    if(!downloading){downloading=true;onDownload(0);}
    loaded[index]=0;
    const stalled=()=>controller.abort(new Error('手部模型下载停滞，请检查网络后重试。'));
    let timer=setTimeout(stalled,30000);
    try {
      const response=await fetch(url,{signal,cache:'force-cache'});
      if(!response.ok||!response.body)throw Error('手部模型文件下载失败，请刷新页面后重试。');
      const reader=response.body.getReader();
      const chunks:Uint8Array<ArrayBuffer>[]=[];
      for(;;) {
        const {done,value}=await reader.read();
        if(done)break;
        clearTimeout(timer);timer=setTimeout(stalled,30000);
        const chunk=new Uint8Array(value);
        chunks.push(chunk);loaded[index]+=chunk.byteLength;
        const now=performance.now();
        if(now-lastReport>160){lastReport=now;onDownload(loaded[0]+loaded[1]+loaded[2]);}
      }
      if(!loaded[index])throw Error('手部模型文件下载失败，请刷新页面后重试。');
      return new Blob(chunks,{type:index===0?'application/wasm':index===2?'text/javascript':'application/octet-stream'});
    } finally {clearTimeout(timer);}
  }
  async function download(url:string,index:number) {
    try{return await downloadOnce(url,index);}
    catch(error){
      signal.throwIfAborted();
      // Only retry a broken transport connection. Missing files and HTTP errors need user action.
      if(!(error instanceof TypeError))throw error;
      try{return await downloadOnce(url,index);}
      catch(retryError){
        signal.throwIfAborted();
        if(!(retryError instanceof TypeError))throw retryError;
        throw Error('手部模型文件下载失败，请刷新页面后重试。');
      }
    }
  }
  async function load(url:string,index:number):Promise<Blob> {
    const inMemory=memoryAssets.get(url);
    if(inMemory)return inMemory;

    const stored=await cache?.match(url).then(response=>response?.blob()).catch(()=>undefined);
    signal.throwIfAborted();
    if(stored?.size){memoryAssets.set(url,stored);return stored;}

    const blob=await download(url,index);
    signal.throwIfAborted();
    memoryAssets.set(url,blob);
    await cache?.put(url,new Response(blob,{headers:{'Content-Type':blob.type}})).catch(()=>{});
    return blob;
  }
  const loader=await load(files.wasmLoaderPath,2);
  const [wasm,model]=await Promise.all([load(files.wasmBinaryPath,0),load(modelPath,1)]);
  signal.throwIfAborted();
  const wasmURL=URL.createObjectURL(wasm),modelURL=URL.createObjectURL(model),loaderURL=URL.createObjectURL(loader);
  return {
    files:{wasmBinaryPath:wasmURL,wasmLoaderPath:loaderURL},
    modelPath:modelURL,
    release(){[wasmURL,modelURL,loaderURL].forEach(url=>URL.revokeObjectURL(url));},
  };
}

export async function initializeCameraTask<T>(
  task:Promise<T>,signal:AbortSignal,dispose?:(value:T)=>void,
  timeoutMessage='手部检测器初始化超时，请重试。',
):Promise<T> {
  let expired=false;
  let cancel:()=>void=()=>{};
  let timeout:ReturnType<typeof setTimeout>|undefined;
  try{
    return await Promise.race([
      task.then(value=>{
        if(expired||signal.aborted){dispose?.(value);throw signal.reason??new Error(timeoutMessage);}
        return value;
      }),
      new Promise<never>((_,reject)=>{
        cancel=()=>{expired=true;reject(signal.reason);};
        if(signal.aborted){cancel();return;}
        signal.addEventListener('abort',cancel,{once:true});
        timeout=setTimeout(()=>{expired=true;reject(new Error(timeoutMessage));},25000);
      }),
    ]);
  }finally{clearTimeout(timeout);signal.removeEventListener('abort',cancel);}
}
