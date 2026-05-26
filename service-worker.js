const CACHE_NAME =
"before-the-exchange-v2";

/* instalar */

self.addEventListener(
"install",
event => {

    event.waitUntil(

        caches.open(
            CACHE_NAME
        )

        .then(cache => {

            return cache.addAll([

                "/",
                "/index.html",
                "/style.css",
                "/script.js",
                "/db.json",
                "/manifest.json"

            ]);
        })
    );
});

/* ativar */

self.addEventListener(
"activate",
event => {

    event.waitUntil(

        caches.keys()
        .then(keys => {

            return Promise.all(

                keys.map(key => {

                    if(
                        key !== CACHE_NAME
                    ){

                        return caches
                        .delete(key);
                    }
                })
            );
        })
    );
});

/* buscar */

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
                .then(networkResponse => {

                    return caches
                    .open(
                        CACHE_NAME
                    )
                    .then(cache => {

                        cache.put(
                            event.request,
                            networkResponse.clone()
                        );

                        return networkResponse;
                    });

                })
            );
        })
    );
});