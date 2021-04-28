// On load
import {error} from "../components/error.js";
import {getPID, storeNewImage} from "../databases/indexedDB.js";
import Annotate from "./annotate.js";
import {getModalData} from "../components/modal.js";
import {addAnnotationCanvas, sendChat} from "./jobSocket.js";
import {saveImage, getJob} from "../databases/database.js";

let myself = "";
let chats = {};

$(async function () {
    myself = await getPID("name");

    JOB_ID = window.location.pathname;
    if (window.location.search.match(/\?id=(\S+)/)) {
        JOB_ID = window.location.search.match(/\?id=(\S+)/)[1];
    }

    await getJob(JOB_ID, initialisePage, null);

    $('#addImage').submit(async function (e) {
        e.preventDefault();

        let [formData, imageData] = await getModalData($('#addImage'));
        addImage(formData, imageData, JOB_ID);
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
        } catch (ignored) {}
    }
    $('.carousel-item:first').addClass('active');
    $('#job-title').html(job.name);
    $(document).prop('title', 'Job - ' + job.name);

    //initialise carousel arrows
    updateCarouselArrows();
}

function addImage(formData, imageData, jobId) {
    saveImage(jobId, formData, imageData, () => {}, processImageCreationError);
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
                <hr class="my-0"/>
                <div class="card-body">
                    <div class="card-title d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${image.title}</h5>
                        <small class="text-muted">By ${image.creator}</small>
                    </div>
                    <p class="card-text">${image.description}</p>
                </div>
                <div class="card-footer">
                    <div class="card">
                        <ul class="card-body chat-container">
                            <li class="message-left multi-message">
                                <span class="message-sender">Bob</span>
                                <span class="message-text">Message left</span>
                            </li>
                            <li class="message-left same-sender">
                                <span class="message-sender">Bob</span>
                                <span class="message-text">Message left</span>
                            </li>
                            <li class="message-right">
                                <span class="message-sender">Ed</span>
                                <span class="message-text">Message right</span>
                            </li>
                        </ul>
                    </div>
                    <form class="chat-submit input-group pt-2">
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

    let chatButton = imageElement.find('.chat-submit')
    chatButton.submit((e) => {
        e.preventDefault();
        sendChat(image._id, chatButton.find("input").val());
        chatButton.find("input").val("");
    });

    let chatContainer = imageElement.find(".chat-container");
    chatContainer.empty();
    chats[image._id] = {
        container: chatContainer,
        chatButton: chatButton,
        prevMessage: null
    }

    if (image.chat) {
        image.chat.forEach(chatObj => newChatMessage(image._id, chatObj));
    }

    imageElement.find('#job-image').replaceWith(annotation.container);

    annotation.addButtons(imageElement.find('.card-header'));

    new MutationObserver(() => {
        if (imageElement.hasClass('active')) {
            chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
        }
    }).observe(imageElement.get(0), {attributeFilter: ['class'], attributeOldValue: true});

    return imageElement;
}

export function newChatMessage(imageId, chatObj) {
    if (imageId in chats) {
        const imageChat = chats[imageId];
        let newMessageElement = $(`<li><span class="message-sender">${chatObj.sender}</span><span class="message-text">${chatObj.message}</span></li>`)
        if (chatObj.sender === myself) {
            newMessageElement.addClass("message-right");
        } else {
            newMessageElement.addClass("message-left");
        }

        if (imageChat.prevMessage && imageChat.prevMessage.sender === chatObj.sender) {
            newMessageElement.addClass("same-sender");
        }

        let scrollHeight = imageChat.container.prop('scrollHeight');
        let scrollPos = imageChat.container.scrollTop() + imageChat.container.innerHeight();
        const autoScroll = scrollHeight - scrollPos <= 0;
        imageChat.container.append(newMessageElement);
        if (autoScroll) {
            imageChat.container.scrollTop(scrollHeight);
        }
        imageChat.prevMessage = chatObj;
        imageChat.prevMessage.element = newMessageElement;
    }
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