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
    $(history).append("<tr><th scope='row'>"+userID+":</th><td class='w-100'>"+message+"</td></tr>")
    let chatmessage = document.getElementById('message'+currentPage);
    $(chatmessage).val('');
}