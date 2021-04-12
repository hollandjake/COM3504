import {newImageAdded, writeOnChatHistory} from "./job.js";
import {storeChatMessage} from "../databases/indexedDB.js";

const job = io.connect('/job');
let annotationCanvases = {}

// On load
$(function () {
    job.emit('join', JOB_ID);
    //Event for when a new image has been added
    job.on('newImage', newImageAdded);
    job.on('chat', async function (imageId, chatObj) {
        await storeChatMessage(JOB_ID, imageId, chatObj);
        writeOnChatHistory(imageId, chatObj);
    });
    job.on('draw', async function (imageId, event) {
        if (imageId in annotationCanvases) {
            annotationCanvases[imageId].onNetworkEvent(event);
        }
    });
})

export function addAnnotationCanvas(image_id, obj) {
    annotationCanvases[image_id] = obj;
}

export function sendChat(image_id, message) {
    let userID = document.getElementById('nav-name').innerHTML;
    job.emit('chat', userID, message, image_id);
}

export function sendAnnotation(image_id, event) {
    job.emit('draw', image_id, event);
}