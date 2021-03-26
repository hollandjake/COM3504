import {newImageAdded} from "./job.js";
const job = io.connect('/job');
import {getPID} from "../databases/indexedDB.js";

let name = null;

// On load
$(function () {
    //Event for when a new image has been added
    job.on('newImage', newImageAdded)

    loadName();

    joinJob(parseInt(JOB_ID));
    job.on('chat', function (jobID, userID, message, currentPage) {
        let who = userID
        if (userID === name) who = 'Me';
        writeOnChatHistory(userID, message, currentPage);
    });

})

async function loadName() {
    // Get name from IndexedDB and show it on the nav bar
    name = await getPID('name');
}

export function joinJob(jobID) {
    job.emit('join', jobID);
}

function writeOnChatHistory(userID, message, currentPage) {
    let history = document.getElementById('chatboxmsg'+currentPage);
    let paragraph = document.createElement('tr');
    paragraph.innerHTML = "\n<th scope=\"row\">"+userID+":</th>\n<td class=\"w-100\">"+message+"</td>\n";
    history.appendChild(paragraph);
    document.getElementsByName('chatmessage')[currentPage].value = '';
}