//cache names
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//icon stuff
const iconSizes = ["192", "512"];
const iconFiles = iconSizes.map(
    (size) => `/icons/icon-${size}x${size}.png`
);

//Main files to cache
const FILES_TO_CACHE = [
    "/",
    "/styles.css",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
].concat(iconFiles);

//INSTALL
self.addEventListener("install", function(evt){
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

//ACTIVATE
self.addEventListener("activate", function(evt){
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Remove old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

//FETCH
self.addEventListener("fetch", function(evt){
    const {url} = evt.request;
    if (url.includes("/all") || url.includes("/find")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(evt.request, response.clone());
                    }

                    return response;
                })
                .catch(error => {
                    return cache.match(evt.request);
                });
            }).catch(error => console.log(error))
        );
    } else {
        evt.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(evt.request).then(response => {
                    return response || fetch(evt.request);
                });
            })
        );
    }
});



// ------------------------------------------
/*
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/style.css",
  "/index.js",
  "/icons/icon-512x512.png",
  "/icons/icon-192x192.png"
];



// install
self.addEventListener("install", function (evt) {
  // pre cache image data
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
    );
    
  // pre cache all static assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );

  // tell the browser to activate this service worker immediately once it
  // has finished installing
  self.skipWaiting();
});

// activate
// self.addEventListener("activate", function(evt) {
//   evt.waitUntil(
//     caches.keys().then(keyList => {
//       return Promise.all(
//         keyList.map(key => {
//           if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//             console.log("Removing old cache data", key);
//             return caches.delete(key);
//           }
//         })
//       );
//     })
//   );

//   self.clients.claim();
// });

// fetch
// self.addEventListener("fetch", function(evt) {
//   const {url} = evt.request;
//   if (url.includes("/all") || url.includes("/find")) {
//     evt.respondWith(
//       caches.open(DATA_CACHE_NAME).then(cache => {
//         return fetch(evt.request)
//           .then(response => {
//             // If the response was good, clone it and store it in the cache.
//             if (response.status === 200) {
//               cache.put(evt.request, response.clone());
//             }

//             return response;
//           })
//           .catch(err => {
//             // Network request failed, try to get it from the cache.
//             return cache.match(evt.request);
//           });
//       }).catch(err => console.log(err))
//     );
//   } else {
//     // respond from static cache, request is not for /api/*
//     evt.respondWith(
//       caches.open(CACHE_NAME).then(cache => {
//         return cache.match(evt.request).then(response => {
//           return response || fetch(evt.request);
//         });
//       })
//     );
//   }
// });
*/