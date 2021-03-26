import {newImageAdded} from "./job.js";
const job = io.connect('/job');

// On load
$(function () {
    //Event for when a new image has been added
    job.on('newImage', newImageAdded)


    joinJob(7);
    job.on('chat', function (jobID, message) {
        writeOnChatHistory(message);
    });

})



export function joinJob(jobID) {
    job.emit('join', jobID);
}

function writeOnChatHistory(message) {
    let history = document.getElementById('chatboxmsg');
    let paragraph = document.createElement('tr');
    paragraph.innerHTML = "\n<th scope=\"row\">Tom:</th>\n<td class=\"w-100\">"+message+"</td>\n";
    history.appendChild(paragraph);
    document.getElementsByName('chatmessage')[0].value = '';
}