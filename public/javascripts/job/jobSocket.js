import {newImageAdded, newChatMessage, newWritingMessage, newKnowledgeGraph, updateKnowledgeGraphColor, deleteKnowledgeGraph} from "./job.js";
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
    job.on('newKnowledgeGraph', async function (properties) {
        newKnowledgeGraph(properties);
    });
    job.on('knowledgeGraphColor', async function (imageId, graphId, color) {
        updateKnowledgeGraphColor(imageId, graphId, color);
    });
    job.on('knowledgeGraphDeleted', async function (imageId, graphId) {
        deleteKnowledgeGraph(imageId, graphId);
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
    let chatObj = {sender: userID, message: message};
    saveChatForImage(imageId, chatObj);
    newChatMessage(imageId, chatObj);
}

export async function sendWritingMessage(imageId) {
    let sender = await getPID('name');
    job.emit('writingMessage', imageId, sender);
}

/**
 * sends a socket.io event of the new knowledge graph element
 * @param {Object} properties
 * @param {String} properties.id
 * @param {String} properties.name
 * @param {String} properties.description
 * @param {String} properties.url
 * @param {int} properties.imageId
 */
export async function sendNewKnowledgeGraph(properties) {
    job.emit('newKnowledgeGraph', properties);
}

/**
 * sends a socket.io event of the annotation colour for the knowledge graph element
 * @param {int} imageId
 * @param {String} graphId
 * @param {String} color
 */
export async function sendKnowledgeGraphColor(imageId, graphId, color) {
    job.emit('knowledgeGraphColor',imageId, graphId, color);
}

/**
 * sends a socket.io event of the removal of a knowledge graph element
 * @param {int} imageId
 * @param {String} graphId
 */
export async function sendKnowledgeGraphDeletion(imageId, graphId) {
    job.emit('knowledgeGraphDeleted',imageId, graphId);
}

export function sendAnnotation(imageId, event) {
    //Send straight to emitting client
    annotationCanvases[imageId].onNetworkEvent(event);
    //Try sending to server
    job.emit('draw', imageId, event);
}