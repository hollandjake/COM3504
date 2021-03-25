import {getName} from "../databases/indexedDB.js";

async function loadName() {
    // Get name from IndexedDB and show it on the nav bar
    let name = await getName();
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

$(async () => await loadName());