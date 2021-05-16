// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let cache= null;
let dataCacheName = 'assignmentData';
let cacheName = 'assigmentCache';
let filesToCache = [
    '/',
    '/javascripts/components/error.js',
    '/javascripts/components/modal.js',
    '/javascripts/components/navbar.js',
    '/javascripts/components/preloadImage.js',
    '/javascripts/databases/database.js',
    '/javascripts/idb/index.js',
    '/javascripts/idb/wrap-idb-value.js',
    '/javascripts/index/index.js',
    '/javascripts/index/jobSocket.js',
    '/javascripts/job/annotate.js',
    '/javascripts/job/job.js',
    '/javascripts/job/jobSocket.js',
    '/javascripts/login/login.js',
    '/stylesheets/generic.css',
    '/stylesheets/index.css',
    '/stylesheets/job.css',
    '/stylesheets/login.css',
    '/stylesheets/modal.css',
    '/jquery/dist/jquery.min.js',
    "/job",
    "/bootstrap-icons/font/fonts/bootstrap-icons.woff?231ce25e89ab5804f9a6c427b8d325c9",
    "/bootstrap-icons/font/fonts/bootstrap-icons.woff2?231ce25e89ab5804f9a6c427b8d325c9",
    "/login",
    "/bootstrap/dist/css/bootstrap.min.css",
    "/bootstrap-icons/font/bootstrap-icons.css",
    "/bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css",
    "/bootstrap/dist/js/bootstrap.bundle.min.js",
    "/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min.js",
];


/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cacheX) {
            console.log('[ServiceWorker] Caching app shell');
            cache= cacheX;
            return cache.addAll(filesToCache);
        })
    );
    console.log("changed");
});



/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    return self.clients.claim();
});

//queries
//TODO: Decide favoured cache method
//TODO: slow when server offline rather than just blocking in network tab (links to above)

//issues
//TODO: jobs not always loading first try
//TODO: Preload multi image jobs
//TODO: fix coors problem
//TODO: socket still working when network down (should be fine, discussion board)

self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Fetch', e.request.url);

    let ignoreUrls = ['/socket.io/?', '/check-online', '/add-image?id=']

    let ignore = false;

    ignoreUrls.forEach((url) => {
        if (e.request.url.indexOf(url) > -1) {
           ignore = true
        }
    });
    if (ignore) {
        //console.log("ignored" + e.request.url)
    } else {
        let shouldIgnore = false;
        if (e.request.url.match(/job\?/)) {
            shouldIgnore = true;
        }

        let fetchMode = {mode:"no-cors"}

        if (e.request.url.indexOf("https") > -1) {
            fetchMode = {mode:"cors"}
        }

        //stale while revalidate
        e.respondWith(
            caches.open(cacheName).then(function (cache) {
                return cache.match(e.request, {ignoreSearch: shouldIgnore}).then(async function (response) {
                    return fetch(e.request, fetchMode)
                        .then(function (networkResponse) {
                            cache.add(e.request.url);
                            return networkResponse;

                        })
                        .catch(function (networkResponse) {
                            return networkResponse || response
                        })
                });
            }),
        );



    }
});