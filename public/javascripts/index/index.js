import {loadImage} from "../components/preloadImage.js";
import {getPID, getJobs, saveJob, getImage} from "../databases/database.js";
import {error} from "../components/error.js";
import {getModalData} from "../components/modal.js";

let loadedJobs = {};

// On load
$(async function () {
    //Ajax call to get the list of jobs
    let currentlyRunningAddJobCallback = null;
    await getJobs(async (jobsData) => {
        if (currentlyRunningAddJobCallback) {
            await currentlyRunningAddJobCallback;
        }
        currentlyRunningAddJobCallback = addAllJobs(jobsData)
    });

    $(document).bind("jobsUpdated",  (e, updatedJobs) => {
        if (updatedJobs.length > 0) {
            window.location.replace("/");
        }
    })

    $('#addJob').submit(async function (e) {
        e.preventDefault();

        let [formData, jobData] = await getModalData($('#addJob'), {
            'job_creator': await getPID('name')
        })

        await saveJob(formData, jobData, (job) => {
            window.location.href = job.url;
        },processJobCreationError);
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
        let imageData = await new Promise((resolve, reject) => getImage(job.imageSequence[0], resolve, reject));
        let image = await loadImage(imageData.imageData, job.name, "img img-fluid");
        let element = $(`<div class="card">` +
            '<div class="card-body">' +
            `<h5 class="card-title">${job.name}</h5>` +
            `<h6 class="card-subtitle mb-2 text-muted">By ${job.creator}</h6>` +
            `<a href="${job.url}" class="stretched-link"></a>` +
            '</div>' +
            '</div>');

        let imageContainer = $('<div class="card-img-top square-image"></div>');
        imageContainer.append(image);

        element.prepend(imageContainer);
        return element;
    }
    return null;
}

function processJobCreationError(e) {
    $("#addJob").append(error(e['responseJSON'].error));
}

async function addAllJobs(jobsData) {
    let jobListElement = $('#job-list-container');

    let newJobsElements = {};

    if (!jobsData || jobsData.length === 0) {
        let element = $(`<div class="card">` +
            '<div class="card-body">' +
            `<h5 class="card-text mb-0 text-center">No Jobs Available</h5>` +
            '</div>' +
            '</div>');
        element.fadeOut(0);
        jobListElement.removeClass('card-columns');
        jobListElement.append(element);
        newJobsElements[""] = element;
        element.fadeIn(500);
    } else {
        jobListElement.addClass('card-columns');
        for (const job of jobsData) {
            try {
                let jobString = JSON.stringify(job);
                if (!(jobString in loadedJobs)) {
                    let element = await createJobElement(job);
                    if (element) {
                        element.fadeOut(0);
                        jobListElement.append(element);
                        newJobsElements[jobString] = element;
                        element.fadeIn(500);
                    }
                } else {
                    newJobsElements[jobString] = loadedJobs[jobString];
                }
            } catch (ignored) {}
        }
    }

    for (const [job, element] of Object.entries(loadedJobs)) {
        if (!(job in newJobsElements)) {
            element.remove();
        }
    }

    loadedJobs = newJobsElements;

}