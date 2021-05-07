// On load
import {error} from "../components/error.js";
import Annotate from "./annotate.js";
import {getModalData} from "../components/modal.js";
import {addAnnotationCanvas, sendChat, sendWritingMessage, sendNewKnowledgeGraph, sendKnowledgeGraphColor, sendKnowledgeGraphDeletion} from "./jobSocket.js";
import {
    attachImageToJob,
    getChatDataForImage,
    getImage,
    getJob,
    getPID,
    saveJobImage
} from "../databases/database.js";

let myself = "";
let chats = {};
let annotationClasses = {};
let currentlyTyping = new Map();
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

$(async function () {
    myself = await getPID("name");

    JOB_ID = window.location.pathname;
    if (window.location.search.match(/\?id=(\S+)/)) {
        JOB_ID = window.location.search.match(/\?id=(\S+)/)[1];
    }

    let currentlyRunningAddJobCallback = null;
    await getJob(JOB_ID, async (jobsData) => {
        if (currentlyRunningAddJobCallback) {
            await currentlyRunningAddJobCallback;
        }
        currentlyRunningAddJobCallback = initialisePage(jobsData)
    });


    $(document).bind("jobsUpdated",  (e, updatedJobs) => {
        for (const index in updatedJobs) {
            let ids = updatedJobs[index];
            let oldId = ids[0];
            let newId = ids[1];
            if (oldId === JOB_ID) {
                window.location.replace("/job?id=" + newId);
            }
        }
    })

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
            let imageData = await new Promise((resolve, reject) => getImage(job.imageSequence[i], resolve, reject));
            let element = await createImageElement(imageData);
            imageListElement.append(element);
        } catch (e) {
            console.log(e);
        }
    }
    $('.carousel-item:first').addClass('active');
    $('#job-title').html(job.name);
    $(document).prop('title', 'Job - ' + job.name);

    //initialise carousel arrows
    updateCarouselArrows();
}

function addImage(formData, imageData, jobId) {
    saveJobImage(jobId, formData, imageData, null, (data) => {
        newImageAdded(data._id);
    }, processImageCreationError);
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
    annotationClasses[image._id] = annotation;

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
                <div class="card-body">
                    <select class="form-control" id="knowledge-graph-type-${image._id}">
                        <option selected value="no">Choose Knowledge Graph Type</option>
                        <option value="Book">Book</option>
                        <option value="BookSeries">BookSeries</option>
                        <option value="EducationalOrganization">EducationalOrganization</option>
                        <option value="Event">Event</option>
                        <option value="GovernmentOrganization">GovernmentOrganization</option>
                        <option value="LocalBusiness">LocalBusiness</option>
                        <option value="Movie">Movie</option>
                        <option value="MovieSeries">MovieSeries</option>
                        <option value="MusicAlbum">MusicAlbum</option>
                        <option value="MusicGroup">MusicGroup</option>
                        <option value="MusicRecording">MusicRecording</option>
                        <option value="Organization">Organization</option>
                        <option value="Periodical">Periodical</option>
                        <option value="Person">Person</option>
                        <option value="Place">Place</option>
                        <option value="SportsTeam">SportsTeam</option>
                        <option value="TVEpisode">TVEpisode</option>
                        <option value="TVSeries">TVSeries</option>
                        <option value="VideoGame">VideoGame</option>
                        <option value="VideoGameSeries">VideoGameSeries</option>
                        <option value="WebSite">WebSite</option>
                    </select>
                    <div class="input-group pt-2">
                        <input id="knowledge-graph-search-${image._id}" type="text" class="form-control" placeholder="Search knowledge graph...">
                        <div class="input-group-append">
                            <div class="btn btn-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0z" fill="none"></path><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"></path></svg>
                            </div>
                        </div>
                    </div>
                    <div class="knowledge-graph-results-container pt-2" id="knowledge-graph-results-container-${image._id}">
                    </div>
                </div>
            </div>
        </div>
    `);

    let chatButton = imageElement.find('.chat-submit');
    let chatInputBox = chatButton.find('input');
    chatButton.submit((e) => {
        e.preventDefault();
        sendChat(image._id, chatInputBox.val());
        chatInputBox.val("");
    });
    chatInputBox.on('input', () => {
        sendWritingMessage(image._id);
    });


    imageElement.find('#knowledge-graph-type-'+image._id).on("change", function() {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [this.value],
            'maxDescChars': 100,
            'selectHandler': (e) => {
                let properties = {
                    id: e.row.id.replaceAll('/',''),
                    name: e.row.name,
                    description: e.row.rc,
                    url: e.row.qc,
                    imageId: image._id
                }
                let knowledgeGraphElement = createKnowledgeGraphElement(properties);
                $('#knowledge-graph-results-container-'+image._id).append(knowledgeGraphElement);
                sendNewKnowledgeGraph(properties);
            },
        }
        KGSearchWidget(apiKey, document.getElementById('knowledge-graph-search-'+image._id), config);
    });

    let chatContainer = imageElement.find(".chat-container");
    chatContainer.empty();
    chats[image._id] = {
        container: chatContainer,
        chatButton: chatButton,
        prevMessage: null
    }

    let imageChat = (await getChatDataForImage(image._id)).chatData;
    imageChat.forEach(chatObj => newChatMessage(image._id, chatObj));

    imageElement.find('#job-image').replaceWith(annotation.container);

    annotation.addButtons(imageElement.find('.card-header'));

    new MutationObserver(() => {
        if (imageElement.hasClass('active')) {
            chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
        }
    }).observe(imageElement.get(0), {attributeFilter: ['class'], attributeOldValue: true});

    return imageElement;
}

function createKnowledgeGraphElement(properties) {
    let knowledgeGraphCard = $(`
        <div class="card knowledge-card" id="${properties.id}" style="width: 19rem;">
            <div class="card-body">
                <h5 class="card-title">${properties.name}</h5>
                <p class="card-text">${properties.description}</p>
                <a href="${properties.url}" target="_blank" class="card-link"><button type="button" class="btn btn-info">Webpage</button></a>
            </div>
        </div>
    `);
    $(`<a><span class="btn btn-success colorpicker-input-addon annotate">Annotate</span></a>`).appendTo(knowledgeGraphCard.find('.card-body')).on("colorpickerChange", (e) => {
        let color = e.color.toString()
        annotationClasses[properties.imageId].color = color;
        knowledgeGraphCard.css('border-color', color);
        sendKnowledgeGraphColor(properties.imageId, properties.id, color)
    }).colorpicker({
        useAlpha: false
    }).children().removeClass('colorpicker-input-addon');
    $(`<button type="button" class="btn btn-danger ml-1 float-right"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
       </button>`).appendTo(knowledgeGraphCard.find('.card-body')).click(() => {
        knowledgeGraphCard.remove();
        sendKnowledgeGraphDeletion(properties.imageId, properties.id);
    });
    return knowledgeGraphCard;
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

export function newKnowledgeGraph(properties) {
    let knowledgeGraphElement = createKnowledgeGraphElement(properties);
    $('#knowledge-graph-results-container-'+properties.imageId).append(knowledgeGraphElement);
}

export function updateKnowledgeGraphColor(imageId, graphId, color) {
    $('#knowledge-graph-results-container-'+imageId+' #'+graphId).css('border-color', color);
}

export function deleteKnowledgeGraph(imageId, graphId) {
    $('#knowledge-graph-results-container-'+imageId+' #'+graphId).remove();
}

function processImageCreationError(e) {
    $("#addImage").append(error(e['responseJSON'].error));
}

//Closes and clears modal form and moves the carousel to the new image
export async function newImageAdded(imageId) {
    getImage(imageId, async (imageData) => {
        attachImageToJob(JOB_ID, imageData);
        let element = await createImageElement(imageData);
        if (element) {
            $('#image-container').append(element);
            updateCarouselArrows();
        }
        if (imageData.creator === await getPID('name')) {
            $('#addImage').modal('hide').trigger("reset");
            $('#imageCarousel').carousel($('#image-container .carousel-item').length - 1);
        }
    }, (e) => {
        processImageCreationError({
            responseJSON: {
                error: "Something went wrong"
            }
        })
        console.log(e);
    });
}