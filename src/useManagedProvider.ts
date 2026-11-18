import {useEffect,useState} from 'react';

export function useManagedProvider(provider:'deepseek') {
  const [available,setAvailable]=useState<boolean|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/managed-providers',{credentials:'same-origin',signal:controller.signal})
      .then(response=>response.ok?response.json():null)
      .then(result=>{if(!controller.signal.aborted)setAvailable(result?.[provider]===true);})
      .catch(()=>{if(!controller.signal.aborted)setAvailable(false);});
    return ()=>controller.abort();
  },[provider]);
  return available;
}
