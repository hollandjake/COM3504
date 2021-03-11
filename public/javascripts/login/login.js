$(async function () {
    //check for support
    if ('indexedDB' in window) {
        await initDatabase();
    } else {
        console.log('This browser doesn\'t support IndexedDB');
    }
})

async function loginFormSubmit() {
    let name = document.getElementById('inputName').value;
    if (name != null)
        await storePID('name',name);
    window.location.href = "/";
}
