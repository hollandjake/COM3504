import {createImageElement, processImageCreationError, closeForm} from "./job.js";
const job = io.connect('/job');

// On load
$(function () {
    job.on('imageAddFailed', processImageCreationError);

    job.on('imageAddSuccess', closeForm);

    //Event for when a new image has been added
    job.on('newImage', async function (data) {
        try {
            let element = await createImageElement(data);
            if (element) {
                $('#image-container').append(element);
            }
        } catch (e) {
            console.log(e);
        }
    })
})

export function joinJob() {
    job.emit('join', jobID);
}

export async function addImage(inputs) {
    let imageData = {
        title: inputs['title'],
        author: inputs['author'],
        description: inputs['description'],
        imageUrl: inputs['url']
    };
    job.emit('add image', jobID, imageData);
    let element = await createImageElement(imageData);
    if (element) {
        $('#image-container').append(element);
    }
}