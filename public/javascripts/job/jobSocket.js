import {newImageAdded, newChatMessage} from "./job.js";
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
        newChatMessage(imageId, chatObj);
    });
    job.on('draw', async function (imageId, event) {
        if (imageId in annotationCanvases) {
            annotationCanvases[imageId].onNetworkEvent(event);
        }
    });
})

export function addAnnotationCanvas(imageId, obj) {
    annotationCanvases[imageId] = obj;
}

export function sendChat(imageId, message) {
    let userID = document.getElementById('nav-name').innerHTML;
    job.emit('chat', userID, message, imageId);
}

export function sendAnnotation(imageId, event) {
    //Send straight to emitting client
    annotationCanvases[imageId].onNetworkEvent(event);
    //Try sending to server
    job.emit('draw', imageId, event);
}