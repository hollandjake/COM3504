import {loadImage} from "../components/preloadImage.js";
import {getPID, getJobs, saveJob, getImage} from "../databases/database.js";
import {error} from "../components/error.js";
import {getModalData} from "../components/modal.js";

let loadedJobs = {};
let noJobs = false;

/**
 * initialises index page events and gets a list of all the jobs
 */
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

/**
 * create a job HTML element
 * @param {Object} job
 * @param {string} job.creator
 * @param {string} job.id
 * @param {string} job.name
 * @param {string} job.url
 * @param {int} job.__v
 * @param {string} job._id
 * @param {Array} job.imageSequence
 * @returns {Element} element
 */
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

/**
 * handles a job creation error
 */
function processJobCreationError(e) {
    $("#addJob").append(error(e['responseJSON'].error));
}

/**
 * handles adding a list of jobs to the index page
 * @param {Array} jobsData
 * @param {Object} jobsData.job
 * @param {string} jobsData.job.creator
 * @param {string} jobsData.job.id
 * @param {string} jobsData.job.name
 * @param {string} jobsData.job.url
 * @param {int} jobsData.job.__v
 * @param {string} jobsData.job._id
 * @param {Array} jobsData.job.imageSequence
 */
async function addAllJobs(jobsData) {
    let jobListElement = $('#job-list-container');

    let newJobsElements = {};

    if (!jobsData || jobsData.length === 0) {
        jobListElement.empty();
        let element = $(`<div class="card" id="no-jobs">` +
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