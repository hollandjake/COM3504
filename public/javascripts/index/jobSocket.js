import {createJobElement} from "./index.js";
const job = io.connect('/job');

// On load
$(function () {
    //Callback for when the job has been created successfully
    job.on('jobCreateRedirect', function (url) {
        if (url) {
            window.location.href = url;
        }
    })

    //Event for when a new job has been added
    job.on('newJob', async function (data) {
        let element = await createJobElement(data);
        if (element) {
            element.fadeOut(0);
            $('#job-list-container').append(element);
            element.fadeIn(500);
        }
    })
})

export function createJob(inputs) {
    let jobData = {
        name: inputs['name'], "imageSequence": [
            {
                title: inputs['title'],
                author: inputs['author'],
                description: inputs['description'],
                imageUrl: inputs['url']
            }
        ]};
    job.emit('create', jobData);
}