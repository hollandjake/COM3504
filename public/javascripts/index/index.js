import {loadImage} from "../components/preloadImage.js";
import {getPID, storeJob} from "../databases/indexedDB.js";
import {error} from "../components/error.js";
import {getModalData} from "../components/modal.js";
import {ajaxRequest} from "../databases/database.js";

// On load
$(async function () {
    //Ajax call to get the list of jobs
    $.ajax({
        type: 'get',
        url: '/job/list',
        success: function (jobsData) {
            let jobListElement = $('#job-list-container');

            jobListElement.empty(); //Remove the child nodes

            if (!jobsData || jobsData.length === 0) {
                let element = $(`<div class="card">` +
                    '<div class="card-body">' +
                    `<h5 class="card-text mb-0 text-center">No Jobs Available</h5>` +
                    '</div>' +
                    '</div>');
                element.fadeOut(0);
                jobListElement.removeClass('card-columns');
                jobListElement.append(element);
                element.fadeIn(500);
            } else {
                jobListElement.addClass('card-columns');
                jobsData.forEach(async job => {
                    try {
                        let element = await createJobElement(job);
                        if (element) {
                            element.fadeOut(0);
                            jobListElement.append(element);
                            element.fadeIn(500);
                        }
                    } catch (e) {
                    }
                })
            }
        }
    })

    $('#addJob').submit(async function (e) {
        e.preventDefault();

        ajaxRequest(
            'get',
            '/asdasd',
            (data) => {
                console.log("success");
                console.log(data);
            },
            () => {
                console.log("offline");
            },
            (error) => {
                console.log("error");
                console.log(error);
            })

        // let formData = await getModalData($('#addJob'), {
        //     'job_creator': await getPID('name')
        // })
        //
        // createJob(formData);
    })

    $("#search-bar").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $("#job-list-container .card").filter(function () {
            $(this).toggle($(this).find(".card-subtitle").text().toLowerCase().indexOf(value) > -1)
        });
    });
})

//Preloads the image so that the browser doesnt reflow the content

export async function createJobElement(job) {
    if (job.imageSequence.length > 0) {
        let image = await loadImage(job.imageSequence[0].imageUrl, job.name, "img img-fluid");
        let element = $(`<div class="card">` +
            '<div class="card-body">' +
            `<h5 class="card-title">${job.name}</h5>` +
            `<h6 class="card-subtitle mb-2 text-muted">By ${job.creator}</h6>` +
            `<a href="/job?id=${job.id}" class="stretched-link"></a>` +
            '</div>' +
            '</div>');

        let imageContainer = $('<div class="card-img-bottom square-image"></div>');
        imageContainer.append(image);

        element.prepend(imageContainer);
        return element;
    }
    return null;
}

export function createJob(formData) {
    //Save image

    $.ajax({
        type: 'POST',
        url: '/job/create',
        data: formData,
        processData: false,
        contentType: false,
        success: processJobCreation,
        error: processJobCreationError
    })
}

function processJobCreationError(e) {
    $("#addJob").append(error(e['responseJSON'].error));
}

async function processJobCreation(data) {
    await storeJob(data.job);
    window.location.href = data.job.url;
}