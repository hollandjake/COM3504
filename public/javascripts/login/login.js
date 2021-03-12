$(async function () {
    //check for support
    if ('indexedDB' in window) {
        await initDatabase();
    } else {
        console.log('This browser doesn\'t support IndexedDB');
    }
    //if they already have a name send them to index
    let name = await getPID('name');
    if (name) {
        window.location.replace('/');
    }
})

async function loginFormSubmit() {
    let name = $('#inputName').val();
    if (name != null) {
        //Simple validation
        name = name.trim();
        if (name.length > 0) {
            await storePID('name', name);
            window.location.replace('/');
        } else {
            $('#inputName').addClass('is-invalid');
        }
    }
}
