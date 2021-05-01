// On load
import {error} from "../components/error.js";
import {getJob, getPID, storeJob, storeNewImage} from "../databases/indexedDB.js";
import Annotate from "./annotate.js";
import {getModalData} from "../components/modal.js";
import {addAnnotationCanvas, sendChat, sendWritingMessage} from "./jobSocket.js";

let myself = "";
let chats = {};
let currentlyTyping = new Map();

$(async function () {
    myself = await getPID("name");
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
        } catch (ignored) {}
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
                        <input name="message" type="text" class="form-control chat-input" placeholder="Type here">
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

    let chatButton = imageElement.find('.chat-submit');
    let chatInputBox = chatButton.find('.chat-input');
    chatButton.submit((e) => {
        e.preventDefault();
        sendChat(image._id, chatButton.find("input").val());
        chatInputBox.val("");
    });
    chatInputBox.on('input', () => {
        sendWritingMessage(image._id);
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

function addMessage(imageChat, messageElement) {
    let scrollHeight = imageChat.container.prop('scrollHeight');
    let scrollPos = imageChat.container.scrollTop() + imageChat.container.innerHeight();
    const autoScroll = scrollHeight - scrollPos <= 0;
    imageChat.container.append(messageElement);
    if (autoScroll) {
        imageChat.container.scrollTop(scrollHeight);
    }
}

export function newChatMessage(imageId, chatObj) {
    if (imageId in chats) {
        const imageChat = chats[imageId];
        let newMessageElement = $(`<li><span class="message-sender">${chatObj.sender}</span><span class="message-text">${chatObj.message}</span></li>`)
        if (chatObj.sender === myself) {
            newMessageElement.addClass("message-right");
        } else {
            newMessageElement.addClass("message-left");
            removeBobble(imageId, chatObj.sender);
        }

        if (imageChat.prevMessage && imageChat.prevMessage.sender === chatObj.sender) {
            newMessageElement.addClass("same-sender");
        }
        addMessage(imageChat, newMessageElement)
        imageChat.prevMessage = chatObj;
        imageChat.prevMessage.element = newMessageElement;
    }
}

function removeBobble(imageId, sender) {
    if (currentlyTyping[imageId] && currentlyTyping[imageId][sender]) {
        clearTimeout(currentlyTyping[imageId][sender].timeout);
        currentlyTyping[imageId][sender].bobber.remove();
        delete currentlyTyping[imageId][sender];
    }
}

export function newWritingMessage(imageId, sender) {
    if (!currentlyTyping[imageId]) {
        currentlyTyping[imageId] = {};
    }
    if (!currentlyTyping[imageId][sender]) {
        const element = $(`
                <li class="message-left">
                    <span class="message-sender">${sender}</span>
                    <span class="message-text">
                        <div id="wave">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </div>
                    </span>
                </li>
            `);
        currentlyTyping[imageId][sender] = {
            "bobber": element
        }
        addMessage(chats[imageId], element);
    }
    if ("timeout" in currentlyTyping[imageId][sender]) {
        clearTimeout(currentlyTyping[imageId][sender].timeout);
    }
    currentlyTyping[imageId][sender].timeout = setTimeout(() => {
        removeBobble(imageId, sender);
    }, 5000);
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