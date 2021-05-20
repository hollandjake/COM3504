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

let cacheName = 'assigmentCache';
let filesToCache = [
    '/',
    '/job',
    '/login',
    '/javascripts/components/error.js',
    '/javascripts/components/modal.js',
    '/javascripts/components/navbar.js',
    '/javascripts/components/preloadImage.js',
    '/javascripts/components/widget.min.js',
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
    '/stylesheets/widget.min.css',
    '/jquery/dist/jquery.min.js',
    '/bootstrap-icons/font/fonts/bootstrap-icons.woff?231ce25e89ab5804f9a6c427b8d325c9',
    '/bootstrap-icons/font/fonts/bootstrap-icons.woff2?231ce25e89ab5804f9a6c427b8d325c9',
    '/bootstrap-icons/font/bootstrap-icons.css',
    "/bootstrap/dist/css/bootstrap.min.css",
    '/bootstrap/dist/js/bootstrap.bundle.min.js',
    '/bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css',
    '/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min.js',
    '/images/favicon.svg',
];


/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
    cacheName += Date.now();

    e.waitUntil([
        self.skipWaiting(),
        caches.open(cacheName).then(cache => cache.addAll(filesToCache))
    ])
});

/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    e.waitUntil([
        self.clients.claim(),
        caches.keys().then(keyList => Promise.all(keyList.filter(key => key !== cacheName).map(key => caches.delete(key))))
    ]);
});

self.addEventListener('fetch', function (e) {

    if (!e.request.url.startsWith(e.currentTarget.origin)) {
        return
    }

    let ignoreUrls = ['/socket.io/?', '/job/', '/image']

    if (!(ignoreUrls.some(url => e.request.url.startsWith(e.currentTarget.origin + url)))) {
        let shouldIgnore = false;
        if (e.request.url.includes('job?')) {
            shouldIgnore = true;
        }

        //stale while revalidate
        e.respondWith(
            caches.open(cacheName).then(
                cache => cache.match(e.request, {ignoreSearch: shouldIgnore})
                    .then(async response => {
                        if (!navigator.onLine) return response;
                        return Promise.race([timeout(400), fetch(e.request)])
                            .then(networkResponse => {
                                cache.add(e.request);
                                return networkResponse;
                            })
                            .catch(() => response)
                    })
            )
        );
    }
});


function timeout(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(new Response('', {
                status: 408,
                statusText: 'Request timed out.'
            }));
        }, delay);
    });
}

