import {newImageAdded, newChatMessage, newWritingMessage, newKnowledgeGraph, updateKnowledgeGraphColor, deleteKnowledgeGraph} from "./job.js";
import {saveChatForImage, getPID, saveKnowledgeForImage, updateKnowledgeColorForImage, removeKnowledgeGraphForImage} from "../databases/database.js";

const job = io.connect('/job');
let annotationCanvases = {}

/**
 * initialises socket.io events when page loads
 */
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
    job.on('newKnowledgeGraph', async function (JSONLD, imageId, color) {
        saveKnowledgeForImage(imageId, JSONLD, color);
        newKnowledgeGraph(JSONLD, imageId, color);
    });
    job.on('knowledgeGraphColor', async function (imageId, graphId, color) {
        updateKnowledgeColorForImage(imageId, graphId, color);
        updateKnowledgeGraphColor(imageId, graphId, color);
    });
    job.on('knowledgeGraphDeleted', async function (imageId, graphId) {
        removeKnowledgeGraphForImage(imageId, graphId);
        deleteKnowledgeGraph(imageId, graphId);
    });
    job.on('draw', async function (imageId, event) {
        if (imageId in annotationCanvases) {
            annotationCanvases[imageId].onNetworkEvent(event);
        }
    });
})

/**
 * updates the list of canvases for this job
 * @param {int} imageId
 * @param {Object} obj
 */
export function addAnnotationCanvas(imageId, obj) {
    annotationCanvases[imageId] = obj;
}

/**
 * sends a socket.io event of a new chat message
 * @param {int} imageId
 * @param {string} message
 */
export async function sendChat(imageId, message) {
    let userID = await getPID('name');
    job.emit('chat', userID, message, imageId);
    let chatObj = {sender: userID, message: message};
    saveChatForImage(imageId, chatObj);
    newChatMessage(imageId, chatObj);
}

/**
 * sends a socket.io event of writing a new chat message
 * @param {int} imageId
 */
export async function sendWritingMessage(imageId) {
    let sender = await getPID('name');
    job.emit('writingMessage', imageId, sender);
}

/**
 * sends a socket.io event of the new knowledge graph element
 * @param {Object} JSONLD
 * @param {string} JSONLD.@id
 * @param {string} JSONLD.name
 * @param {string} JSONLD.detailedDescription.articleBody
 * @param {string} JSONLD.url
 * @param {int} imageId
 * @param {string} color
 */
export async function sendNewKnowledgeGraph(JSONLD, imageId, color) {
    saveKnowledgeForImage(imageId, JSONLD, color);
    job.emit('newKnowledgeGraph', JSONLD, imageId, color);
}

/**
 * sends a socket.io event of the annotation colour for the knowledge graph element
 * @param {int} imageId
 * @param {string} graphId
 * @param {string} color
 */
export async function sendKnowledgeGraphColor(imageId, graphId, color) {
    updateKnowledgeColorForImage(imageId, graphId, color);
    job.emit('knowledgeGraphColor',imageId, graphId, color);
}

/**
 * sends a socket.io event of the removal of a knowledge graph element
 * @param {int} imageId
 * @param {string} graphId
 */
export async function sendKnowledgeGraphDeletion(imageId, graphId) {
    removeKnowledgeGraphForImage(imageId, graphId);
    job.emit('knowledgeGraphDeleted',imageId, graphId);
}

/**
 * sends a socket.io event of a new annotation
 * @param {int} imageId
 * @param {Event} event
 */
export function sendAnnotation(imageId, event) {
    //Send straight to emitting client
    annotationCanvases[imageId].onNetworkEvent(event);
    //Try sending to server
    job.emit('draw', imageId, event);
}