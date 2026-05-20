// ═══════════════════════════════════════
// SERVICE WORKER - Craftoo FCM
// ═══════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCdDLq6GMRCLhYegXdb6d89SA6utQZWsMw",
  authDomain: "crafoo-e5722.firebaseapp.com",
  projectId: "crafoo-e5722",
  storageBucket: "crafoo-e5722.firebasestorage.app",
  messagingSenderId: "397054443206",
  appId: "1:397054443206:web:cc1f30b9e3361c18cc61c7"
});

var messaging = firebase.messaging();

// إشعارات في الخلفية (التطبيق مغلق)
messaging.onBackgroundMessage(function(payload){
  var title = payload.notification && payload.notification.title
    ? payload.notification.title
    : "💬 Craftoo";
  var body = payload.notification && payload.notification.body
    ? payload.notification.body
    : "Nouveau message";

  self.registration.showNotification(title, {
    body: body,
    icon: "/craftoo/logo.png",
    badge: "/craftoo/logo.png",
    tag: "craftoo-message",
    renotify: true,
    data: { url: "/craftoo/?openInbox=1" }
  });
});

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(clients.claim());
});

// عند الضغط على الإشعار
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = "/craftoo/?openInbox=1";
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clientList){
      for(var i = 0; i < clientList.length; i++){
        var client = clientList[i];
        if(client.url.indexOf('craftoo') !== -1 && 'focus' in client){
          client.postMessage({action:'openInbox'});
          return client.focus();
        }
      }
      if(clients.openWindow){
        return clients.openWindow(url);
      }
    })
  );
});

// إشعارات محلية من داخل التطبيق
self.addEventListener('message', function(e){
  if(e.data && e.data.action === 'showNotif'){
    self.registration.showNotification(e.data.title || "💬 Craftoo", {
      body: e.data.body || "Nouveau message",
      icon: "/craftoo/logo.png",
      badge: "/craftoo/logo.png",
      tag: "craftoo-message",
      renotify: true,
      data: { url: "/craftoo/?openInbox=1" }
    });
  }
});

