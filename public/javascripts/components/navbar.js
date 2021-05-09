import {getAllFromCache, getPID, pushingToServer} from "../databases/database.js";

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

    if (navigator.onLine) await pushingToServer(() => {console.log(error)});

    window.addEventListener('online', async () => {
        console.log("triggered");
        await pushingToServer(() => {console.log(error)})
    });

})

