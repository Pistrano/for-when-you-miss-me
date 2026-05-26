const CACHE_NAME =
"before-the-exchange-v1";

const urlsToCache = [

"/",
"/index.html",
"/style.css",
"/script.js",
"/db.json",
"/manifest.json",

"/covers/romantic.jpg"

];

/* instala */

self.addEventListener(
"install",
event => {

    event.waitUntil(

        caches.open(
            CACHE_NAME
        )

        .then(cache => {

            return cache
            .addAll(
                urlsToCache
            );
        })
    );
});

/* responder offline */

self.addEventListener(
"fetch",
event => {

    event.respondWith(

        caches.match(
            event.request
        )

        .then(response => {

            return (
                response ||
                fetch(
                    event.request
                )
            );
        })
    );
});