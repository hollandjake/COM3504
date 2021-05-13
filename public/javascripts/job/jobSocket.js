import {newImageAdded, newChatMessage, newWritingMessage} from "./job.js";
import {saveChatForImage, getPID} from "../databases/database.js";

const job = io.connect('/job');
let annotationCanvases = {}

// On load
$(function () {
    job.emit('join', JOB_ID);
    //Event for when a new image has been added
    job.on('newImage', newImageAdded);
    job.on('chat', async function (imageId, chatObj) {
        saveChatForImage(imageId, chatObj);
        newChatMessage(imageId, chatObj);
    });
    job.on('writingMessage', async function (imageId, sender) {
        newWritingMessage(imageId, sender);
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

export async function sendChat(imageId, message) {
    let userID = await getPID('name');
    job.emit('chat', userID, message, imageId);
}

export async function sendWritingMessage(imageId) {
    let sender = await getPID('name');
    job.emit('writingMessage', imageId, sender);
}

export function sendAnnotation(imageId, event) {
    //Send straight to emitting client
    annotationCanvases[imageId].onNetworkEvent(event);
    //Try sending to server
    job.emit('draw', imageId, event);
}