import {createImageElement, processImageCreationError, newImageAdded, imageAddSuccess} from "./job.js";
const job = io.connect('/job');

// On load
$(function () {
    job.on('imageAddFailed', processImageCreationError);

    job.on('imageAddSuccess', imageAddSuccess);

    //Event for when a new image has been added
    job.on('newImage', newImageAdded)
})

export function joinJob(jobID) {
    job.emit('join', jobID);
}

export async function addImage(inputs, jobID) {
    let imageData = {
        title: inputs['title'],
        author: inputs['author'],
        description: inputs['description'],
        imageUrl: inputs['url']
    };
    job.emit('add image', jobID, imageData);
}