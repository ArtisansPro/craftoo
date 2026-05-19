// ═══════════════════════════════════════
// SERVICE WORKER - Craftoo Notifications
// ═══════════════════════════════════════

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(clients.claim());
});

// استقبال الإشعارات Push
self.addEventListener('push', function(e){
  var data = {};
  if(e.data){
    try{ data = e.data.json(); }catch(err){ data = {title:"Craftoo", body: e.data.text()}; }
  }
  var title = data.title || "💬 Craftoo";
  var options = {
    body: data.body || "Nouveau message",
    icon: data.icon || "/craftoo/logo.png",
    badge: data.icon || "/craftoo/logo.png",
    tag: "craftoo-message",
    renotify: true,
    data: { url: data.url || "/craftoo/" }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// عند الضغط على الإشعار - يفتح التطبيق مباشرة في الرسائل
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = e.notification.data && e.notification.data.url ? e.notification.data.url : "/craftoo/";
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clientList){
      // إذا التطبيق مفتوح مسبقاً - ركز عليه
      for(var i=0; i<clientList.length; i++){
        var client = clientList[i];
        if(client.url.indexOf('craftoo') !== -1 && 'focus' in client){
          client.postMessage({action:'openInbox'});
          return client.focus();
        }
      }
      // إذا التطبيق مغلق - افتحه
      if(clients.openWindow){
        return clients.openWindow(url + "?openInbox=1");
      }
    })
  );
});

// إشعارات محلية عند وصول رسالة جديدة (بدون Push Server)
self.addEventListener('message', function(e){
  if(e.data && e.data.action === 'showNotif'){
    var title = e.data.title || "💬 Craftoo";
    var options = {
      body: e.data.body || "Nouveau message",
      icon: "/craftoo/logo.png",
      badge: "/craftoo/logo.png",
      tag: "craftoo-message",
      renotify: true,
      data: { url: "/craftoo/?openInbox=1" }
    };
    self.registration.showNotification(title, options);
  }
});

