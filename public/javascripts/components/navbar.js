import {getImages, getPID, pushingToServer} from "../databases/database.js";

async function loadName() {
    // Get name from IndexedDB and show it on the nav bar
    let name = await getPID('name');
    if (name) {
        let nameElement = $('#nav-name');
        nameElement.text(name);
        nameElement.toggleClass('invisible visible');
    } else {
        if (window.location.pathname !== '/login') {
            window.location.replace('/login');
        }
    }
}

$(async function () {

    await loadName();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .getRegistration("/")
            .then(function(registration) {
                if (registration) {
                    registration.update();
                } else {
                    navigator.serviceWorker.register('./service-worker.js');
                    console.log('Service Worker Registered');
                }
            });
    }

    if (navigator.onLine)  {
        getImages();
        await pushingToServer(() => {console.log(error)});
    }

    window.addEventListener('online', async () => {
        getImages();
        await pushingToServer(() => {console.log(error)})
    });

})

