// On load
import {error} from "../components/error.js";
import {getJob, getPID, storeJob, storeNewImage} from "../databases/indexedDB.js";
import Annotate from "./annotate.js";
import {getModalData} from "../components/modal.js";
import {addAnnotationCanvas, sendChat} from "./jobSocket.js";

$(async function () {
    let jobLocal = await getJob(JOB_ID);
    if (jobLocal) {
        await initialisePage(jobLocal, true);
    } else {
        $.ajax({
            type: 'get',
            url: window.location.pathname + '/list',
            success: async function (job) {
                await initialisePage(job, true);
                await storeJob(job);
            }
        });
    }

    $('#addImage').submit(async function (e) {
        e.preventDefault();

        let inputs = await getModalData($('#addImage'));
        await addImage(inputs, JOB_ID);
    })

    $('#imageCarousel').carousel({
        wrap: false
    }).on('slid.bs.carousel', function () {
        updateCarouselArrows();
    });
})

async function initialisePage(job) {
    let imageListElement = $('#image-container');

    imageListElement.empty();

    for (let i = 0; i < job.imageSequence.length; i++) {
        try {
            let element = await createImageElement(job.imageSequence[i]);
            imageListElement.append(element);
        } catch (e) {
        }
    }
    $('.carousel-item:first').addClass('active');
    $('#job-title').html(job.name);
    $(document).prop('title', 'Job - ' + job.name);

    //initialise carousel arrows
    updateCarouselArrows();
}

async function addImage(inputs, jobID) {
    $.ajax({
        type: 'POST',
        url: `/job/${jobID}/add-image`,
        data: inputs,
        processData: false,
        contentType: false,
        error: function (e) {
            processImageCreationError(e['responseJSON']);
        }
    })
}

//Hides left or right arrows if no images in that direction and if there are no more images to the right it shows the add button
function updateCarouselArrows() {
    let curSlide = $('.carousel-item.active');
    if (curSlide.is(':first-child')) {
        $('.left').hide();
    } else {
        $('.left').css('display', 'flex');
    }
    if (curSlide.is(':last-child')) {
        $('.right').hide();
        $('.add').css('display', 'flex');
    } else {
        $('.right').css('display', 'flex');
        $('.add').hide();
    }
}

async function createImageElement(image) {
    const annotation = await new Annotate(image, "card-img-top rounded-0", "card-img-top job-image rounded-0").init();

    addAnnotationCanvas(image._id, annotation);

    let imageElement = $(`
        <div class="carousel-item">
            <div class="card w-50 mx-auto">
                <div class="card-header d-flex justify-content-between align-items-center"></div>
                <div id="job-image"></div>
                <div class="card-footer">
                    <div class="card-title d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${image.title}</h5>
                        <small class="text-muted">By ${image.creator}</small>
                    </div>
                    <p class="card-text">${image.description}</p>
                </div>
            </div>
            <div class="card-text card w-50 mx-auto mt-2 text-box">
                <div class="overflow-auto d-inline-block">
                    <table class="table table-striped mb-0 w-100">
                        <tbody id="chatboxmsg${image._id}" class="w-100"></tbody>
                    </table>
                </div>
                <div class="card-footer">
                    <form id="chat-submit" class="input-group container pt-2">
                        <input name="message" type="text" class="form-control" placeholder="Type here">
                        <div class="input-group-append">
                            <button type="submit" class="btn btn-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" ><path d="M0 0h24v24H0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/></svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `);

    let chat_submit = imageElement.find('#chat-submit')
    chat_submit.submit((e) => {
        e.preventDefault();

        let chat1 = chat_submit.serializeArray()[0].value;

        chat_submit.find("input").val("");

        sendChat(image._id, chat1);
    });

    chat_submit.removeAttr("id");


    image.chat.forEach(chatObj => {
        imageElement.find('#chatboxmsg' + image._id).append("<tr><th scope='row'>" + chatObj.sender + ":</th><td class='w-100'>" + chatObj.message + "</td></tr>");
    })

    imageElement.find('#job-image').replaceWith(annotation.container);

    annotation.addButtons(imageElement.find('.card-header'));


    return imageElement;
}

export function writeOnChatHistory(imageId, chatObj) {
    let history = $('#chatboxmsg' + imageId);
    $(history).append("<tr><th scope='row'>" + chatObj.sender + ":</th><td class='w-100'>" + chatObj.message + "</td></tr>")
}

function processImageCreationError(data) {
    $("#addImage").append(error(data.error));
}

//Closes and clears modal form and moves the carousel to the new image
export async function newImageAdded(data) {
    try {
        await storeNewImage(JOB_ID, data.image);
        let element = await createImageElement(data.image);
        if (element) {
            $('#image-container').append(element);
            updateCarouselArrows();
        }
        if (data.image.creator === await getPID('name')) {
            $('#addImage').modal('hide').trigger("reset");
            $('#imageCarousel').carousel($('#image-container .carousel-item').length - 1);
        }
    } catch (e) {
        processImageCreationError({
            error: "Something went wrong"
        })
        console.log(e);
    }
}