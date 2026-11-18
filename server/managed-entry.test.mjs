import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPlatformServer} from './app.mjs';
import {createAccessGate} from './access.mjs';
import {setAccount} from './users.mjs';

test('single-password and guest entries preserve separate DeepSeek credentials',async t=>{
  const accountName='entry-account';
  const {users}=await setAccount({version:1,users:[]},accountName,'test-entry-password');
  const gate=createAccessGate({users,passwordAccount:accountName,builtInDeepSeek:true,secret:'test-entry-session'});
  const requestedKeys=[];
  const request=globalThis.fetch;
  t.mock.method(globalThis,'fetch',async (target,options)=>{
    assert.equal(target,'https://api.deepseek.com/chat/completions');
    requestedKeys.push(options.headers.Authorization);
    return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({label:'cup',present:true})}}]});
  });
  const server=createPlatformServer(gate,undefined,{PLATFORM_DEEPSEEK_API_KEY:'test-built-in-key'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
  const base='http://127.0.0.1:'+server.address().port;
  for(const [language,login,guest] of [
    ['zh','用密码进入 · 内置 API','访客进入 · 无内置 API'],
    ['en','Sign in · Built-in API','Guest · Use your own key'],
  ]){
    const page=await request(base+'/?lang='+language);
    assert.match(page.headers.get('set-cookie'),new RegExp('ui_lang='+language));
    const html=await page.text();
    assert.equal((html.match(/<input\b/g)??[]).length,1);
    assert.doesNotMatch(html,/name="username"/);
    assert.ok(html.indexOf(login)>=0&&html.indexOf(guest)>html.indexOf(login));
    const error=await request(base+'/auth/login?lang='+language,{method:'POST',body:'password=wrong',redirect:'manual'});
    assert.equal(error.status,401);
    assert.match(await error.text(),language==='en'?/Incorrect password/:/密码不正确/);
  }
  async function signIn(path,body){
    const response=await request(base+path,{method:'POST',body,redirect:'manual'});
    assert.equal(response.status,303);
    return response.headers.get('set-cookie').split(';')[0];
  }
  const signedIn=await signIn('/auth/login','password=test-entry-password');
  const guest=await signIn('/auth/guest','');
  for(const [cookie,deepseek] of [[signedIn,true],[guest,false]]){
    const response=await request(base+'/api/managed-providers',{headers:{cookie}});
    assert.deepEqual(await response.json(),{deepseek});
  }
  const detect=(cookie,extra)=>request(base+'/api/objects/detect',{
    method:'POST',headers:{cookie,origin:base,'Content-Type':'application/json'},
    body:JSON.stringify({provider:'deepseek',model:'deepseek-flash',task:'presence',label:'cup',consent:true,image:'data:image/jpeg;base64,/9j/AA==',...extra}),
  });
  assert.equal((await detect(guest,{managed:true})).status,403);
  assert.equal((await detect(signedIn,{managed:true,consent:false})).status,400);
  assert.deepEqual(requestedKeys,[]);
  for(const [cookie,body] of [[signedIn,{managed:true}],[guest,{key:'test-guest-api-key'}]]){
    const response=await detect(cookie,body);
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{label:'cup',present:true,model:'deepseek-flash'});
  }
  assert.deepEqual(requestedKeys,['Bearer test-built-in-key','Bearer test-guest-api-key']);
  for(let i=0;i<15;i++){
    const wrong=await request(base+'/auth/login?lang=en',{method:'POST',body:'password=wrong',redirect:'manual'});
    assert.equal(wrong.status,401);
  }
  const limited=await request(base+'/auth/login?lang=en',{method:'POST',body:'password=test-entry-password',redirect:'manual'});
  assert.equal(limited.status,429);
  assert.match(await limited.text(),/Too many sign-in attempts/);
  await signIn('/auth/guest','');

});
