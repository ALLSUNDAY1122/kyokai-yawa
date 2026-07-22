import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const prefix='/kyokai-yawa';
const port=Number(process.env.PORT||4173);
const types={
  '.html':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.mjs':'application/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.xml':'application/xml; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.webmanifest':'application/manifest+json; charset=utf-8',
};

const send=(response,status,body,type='text/plain; charset=utf-8')=>{
  response.writeHead(status,{'content-type':type,'cache-control':'no-store'});
  response.end(body);
};

const server=http.createServer((request,response)=>{
  const url=new URL(request.url||'/',`http://${request.headers.host||'127.0.0.1'}`);
  if(url.pathname===prefix){response.writeHead(302,{location:`${prefix}/`});response.end();return;}
  if(!url.pathname.startsWith(`${prefix}/`)){send(response,404,'Not Found');return;}
  let relative=decodeURIComponent(url.pathname.slice(prefix.length+1));
  if(!relative||relative.endsWith('/'))relative+=relative?'index.html':'index.html';
  const file=path.resolve(root,relative);
  if(file!==root&&!file.startsWith(`${root}${path.sep}`)){send(response,403,'Forbidden');return;}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){send(response,404,'Not Found');return;}
    response.writeHead(200,{
      'content-type':types[path.extname(file).toLowerCase()]||'application/octet-stream',
      'cache-control':'no-store',
    });
    fs.createReadStream(file).pipe(response);
  });
});

server.listen(port,'127.0.0.1',()=>console.log(`Playwright server: http://127.0.0.1:${port}${prefix}/`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
