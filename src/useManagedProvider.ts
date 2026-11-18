import {useEffect,useState} from 'react';

export function useManagedProvider(provider:'deepseek') {
  const [available,setAvailable]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/managed-providers',{credentials:'same-origin',signal:controller.signal})
      .then(response=>response.ok?response.json():null)
      .then(result=>{if(!controller.signal.aborted)setAvailable(result?.[provider]===true);})
      .catch(()=>{});
    return ()=>controller.abort();
  },[provider]);
  return available;
}
