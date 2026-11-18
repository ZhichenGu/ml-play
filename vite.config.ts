import {defineConfig} from 'vite';
import {createPlatformApi} from './server/app.mjs';
import {createAccessGate} from './server/access.mjs';

export default defineConfig({
  server:{fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**','**/users.json']}},
  plugins:[{
    name:'password-access',
    configureServer(server){
      const gate=createAccessGate();
      server.middlewares.use(gate);
      server.middlewares.use(createPlatformApi(gate));
      server.httpServer?.prependListener('upgrade',(req,socket)=>{
        if(!gate.isAuthorized(req)){socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');socket.destroy();}
      });
    },
    configurePreviewServer(server){
      const gate=createAccessGate();
      server.middlewares.use(gate);
      server.middlewares.use(createPlatformApi(gate));
    }
  }],
});
