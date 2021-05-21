import {createJobElement} from "./index.js";
const job = io.connect('/job');

/**
 * initialises socket.io events when page loads
 */
$(function () {
    //Event for when a new job has been added
    job.on('newJob', async function (data) {
        try {
            let container = $('#job-list-container');
            let element = await createJobElement(data);
            if (element) {
                if (container.has('#no-jobs')) {
                    container.empty();
                    container.addClass('card-columns');
                }
                element.fadeOut(0);
                container.append(element);
                element.fadeIn(500);
            }
        } catch (e) {}
    })
})