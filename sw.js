const CACHE = 'ski-one-shell-0.45.4';
const SHELL = ['./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(url=>new Request(url,{cache:'reload'}))))); });
self.addEventListener('activate', event => { event.waitUntil((async()=>{ for(const key of await caches.keys()) if(key.startsWith('ski-one-shell-') && key!==CACHE) await caches.delete(key); await self.clients.claim(); })()); });
self.addEventListener('fetch', event => {
 const req=event.request, url=new URL(req.url), scope=new URL(self.registration.scope);
 if(req.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)) return;
 if(req.mode==='navigate' && (url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html')) {
  event.respondWith((async()=>{try {const response=await fetch(req,{cache:'no-store'}); if(response.ok){const cache=await caches.open(CACHE); await cache.put('./index.html',response.clone());} return response;} catch(e){return (await caches.match('./index.html'))||Response.error();}})()); return;
 }
 if(SHELL.some(path=>new URL(path,scope).pathname===url.pathname)) event.respondWith(fetch(req).catch(async()=> (await caches.match(req,{ignoreSearch:true}))||Response.error()));
});
