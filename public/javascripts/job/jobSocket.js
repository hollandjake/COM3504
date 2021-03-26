import {newImageAdded} from "./job.js";
const job = io.connect('/job');
import {getPID} from "../databases/indexedDB.js";

let name = null;

// On load
$(function () {
    //Event for when a new image has been added
    job.on('newImage', newImageAdded)

    loadName();

    let cb = getRoomID(window.location.pathname);
    joinJob(parseInt(cb));
    job.on('chat', function (jobID, userID, message) {
        let who = userID
        if (userID === name) who = 'Me';
        writeOnChatHistory(who, message);
    });

})

function getRoomID(url){
    url = url.replace(/#[^#]+$/, "").replace(/\?[^\?]+$/, "").replace(/\/$/, "");
    return url.substr(url.lastIndexOf("/") + 1);
}


async function loadName() {
    // Get name from IndexedDB and show it on the nav bar
    name = await getPID('name');
}

export function joinJob(jobID) {
    job.emit('join', jobID);
}

function writeOnChatHistory(userID, message) {
    let history = document.getElementById('chatboxmsg');
    let paragraph = document.createElement('tr');
    paragraph.innerHTML = "\n<th scope=\"row\">"+userID+":</th>\n<td class=\"w-100\">"+message+"</td>\n";
    history.appendChild(paragraph);
    document.getElementsByName('chatmessage')[0].value = '';
}