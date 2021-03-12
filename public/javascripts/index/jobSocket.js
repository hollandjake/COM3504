import {createJobElement} from "./index.js";

// On load
$(function () {
    let job = io.connect('/job');

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

    //
    $('#create-job-button').click(function(e) {
        job.emit('create', {name: "TestJobName", "imageSequence": [
                {
                    title: 'SomeTitle',
                    author: 'SomeAuthor',
                    description: 'SomeDescription',
                    imageUrl: '/images/cathedral.jpg'
                }
            ]});
    })
})