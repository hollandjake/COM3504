import {getPID, savePID} from "../databases/database.js";

/**
 * if user already has a name then send them to the index page
 */
$(async function () {
    //if they already have a name send them to index
    let name = await getPID('name');
    if (name) {
        window.location.replace('/');
    }
})

/**
 * initialises login submit button event
 */
$(function() {
    $('#login-form').submit(function(e) {
        e.preventDefault();

        let inputNameField = $('#inputName');
        let name = inputNameField.val();

        if (name != null) {
            //Simple validation
            name = name.trim();
            if (name.length > 0) {
                savePID('name', name).then(() => window.location.replace('/'));
            } else {
                inputNameField.addClass('is-invalid');
            }
        }
    })
})