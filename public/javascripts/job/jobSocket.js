import {writeOnChatHistory} from "./job.js";
import {storeChatMessage} from "../databases/indexedDB.js";
const job = io.connect('/job');


// On load
$(function () {
    //Event for when a new image has been added
    //job.on('newImage', newImageAdded);

    job.on('chat', async function (imageId, chatObj) {
        await storeChatMessage(JOB_ID, imageId, chatObj);
        writeOnChatHistory(imageId, chatObj);
    });
    job.emit('join', JOB_ID);
})



export function joinJob(jobID) {
    job.emit('join', jobID);
}

