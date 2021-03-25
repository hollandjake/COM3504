import {newImageAdded} from "./job.js";
const job = io.connect('/job');

// On load
$(function () {
    //Event for when a new image has been added
    job.on('newImage', newImageAdded)
})

export function joinJob(jobID) {
    job.emit('join', jobID);
}