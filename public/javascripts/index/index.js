import {createJob} from "./jobSocket.js";
import {loadImage} from "../components/preloadImage.js";

// On load
$(function () {
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
                    } catch (e) {}
                })
            }
        }
    })

    $('#addJob').submit(function(e) {
        e.preventDefault();

        let inputs = {};
        $.each($('#addJob').serializeArray(), function(i, field) {
            inputs[field.name] = field.value;
        });

        if (!inputs['url']) {
            let files = $('#inputImageUpload').prop('files');
            let file = files[0];
            let fr = new FileReader();
            fr.onload = () => {
                inputs['url'] = fr.result;
                createJob(inputs);
            }
            if (file) {
                fr.readAsDataURL(file);
            } else {
                processJobCreationError('Failed to create Job');
            }
        } else {
            createJob(inputs);
        }
    })
})

//Preloads the image so that the browser doesnt reflow the content

export async function createJobElement(job) {
    if (job.imageSequence.length > 0) {
        let image = await loadImage(job.imageSequence[0].imageUrl, job.name, "img img-fluid");
        let element = $(`<div class="card">` +
            '<div class="card-body">' +
            `<h5 class="card-text mb-0">${job.name}</h5>` +
            `<a href="/job/${job.id}" class="stretched-link"></a>` +
            '</div>' +
            '</div>');

        let imageContainer = $('<div class="card-img-bottom square-image"></div>');
        imageContainer.append(image);

        element.prepend(imageContainer);
        return element;
    }
    return null;
}

export function processJobCreationError(errorMessage) {
    $("#addJob").append($('<div class="alert alert-warning alert-dismissible fade show modal-dialog" role="alert">\n' +
        `  <strong>Holy guacamole!</strong> ${errorMessage}` +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>'));
}