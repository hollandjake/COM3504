import {createJobElement} from "./index.js";
const job = io.connect('/job');

/**
 * initialises socket.io events when page loads
 */
$(function () {
    //Event for when a new job has been added
    job.on('newJob', async function (data) {
        try {
            let element = await createJobElement(data);
            if (element) {
                element.fadeOut(0);
                $('#job-list-container').append(element);
                element.fadeIn(500);
            }
        } catch (e) {}
    })
})