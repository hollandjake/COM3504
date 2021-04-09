import {newImageAdded, writeOnChatHistory} from "./job.js";
import {storeChatMessage} from "../databases/indexedDB.js";

const job = io.connect('/job');


// On load
$(function () {
    job.emit('join', JOB_ID);
    //Event for when a new image has been added
    job.on('newImage', newImageAdded);
    job.on('chat', async function (imageId, chatObj) {
        await storeChatMessage(JOB_ID, imageId, chatObj);
        writeOnChatHistory(imageId, chatObj);
    });
})

export function sendChat(image_id, message) {
    let userID = document.getElementById('nav-name').innerHTML;

    job.emit('chat', JOB_ID, userID, message, image_id);
}