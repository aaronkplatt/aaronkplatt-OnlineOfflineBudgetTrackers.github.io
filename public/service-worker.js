//cache names
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//icon stuff only 2 (if confused look at in class /18-PWA/Stu_NoteTaker_PWA)
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
