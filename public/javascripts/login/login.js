import {initDatabase, getPID, storePID} from "../databases/indexedDB.js";

$(async function () {
    //check for support
    if ('indexedDB' in window) {
        await initDatabase();
    }
    //if they already have a name send them to index
    let name = await getPID('name');
    if (name) {
        window.location.replace('/');
    }
})

$(function() {
    $('#login-form').submit(function(e) {
        e.preventDefault();

        let inputNameField = $('#inputName');
        let name = inputNameField.val();

        if (name != null) {
            //Simple validation
            name = name.trim();
            if (name.length > 0) {
                storePID('name', name).then(() => window.location.replace('/'));
            } else {
                inputNameField.addClass('is-invalid');
            }
        }
    })
})