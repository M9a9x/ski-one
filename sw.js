const CACHE='ski-one-shell-1.0.1';
const ROOT=self.registration.scope;
const INDEX=new URL('index.html',ROOT).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const response=await fetch(INDEX,{cache:'reload'});
 if(!response.ok) throw new Error('App shell unavailable');
 await cache.put(INDEX,response);
 // Icons and manifest must not prevent installation.
 await Promise.allSettled(['manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'].map(p=>cache.add(new URL(p,ROOT).href)));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await self.clients.claim();
 for(const key of await caches.keys()) if(key.startsWith('ski-one-shell-')&&key!==CACHE) await caches.delete(key);
})()));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),scope=new URL(ROOT);
 if(req.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(req.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html')){
 event.respondWith((async()=>{
  try{const res=await fetch(INDEX,{cache:'no-store'});if(res.ok){try{await (await caches.open(CACHE)).put(INDEX,res.clone());}catch{}return res;}}catch{}
  return (await caches.match(INDEX))||new Response('SKI ONE: Bitte Internetverbindung prüfen und die App erneut öffnen.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 })());
 }
});

self.addEventListener('push',e=>{let p;try{p=e.data.json()}catch{p={title:'SKI ONE',body:'Neue Weltcup-Aktivität'}}e.waitUntil(self.registration.showNotification(p.title,{body:p.body,icon:new URL('icon-192.png',ROOT).href,tag:p.tag||undefined}));});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil((async()=>{const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});const c=cs.find(x=>x.url.startsWith(ROOT));if(c)return c.focus();return self.clients.openWindow(ROOT);})());});
