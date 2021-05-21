// On load
import {error} from "../components/error.js";
import Annotate from "./annotate.js";
import {getModalData} from "../components/modal.js";
import {addAnnotationCanvas, sendChat, sendWritingMessage, sendNewKnowledgeGraph, sendKnowledgeGraphColor, sendKnowledgeGraphDeletion} from "./jobSocket.js";
import {
    attachImageToJob,
    getChatDataForImage,
    getKnowledgeGraphDataForImage,
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

/**
 * initialises job page events and gets the job data
 */
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

    window.addEventListener("online", e => {
        $('.knowledge-graph-search').prop('disabled', false);
    });
    window.addEventListener("offline", e => {
        $('.knowledge-graph-search').prop('disabled', true);
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

/**
 * initialise the job page with job data
 * @param {Object} job
 * @param {string} job.creator
 * @param {string} job.id
 * @param {string} job.name
 * @param {string} job.url
 * @param {int} job.__v
 * @param {string} job._id
 * @param {Array} job.imageSequence
 */
async function initialisePage(job) {
    let imageListElement = $('#image-container');

    imageListElement.empty();

    for (let i = 0; i < job.imageSequence.length; i++) {
        try {
            let imageData = await new Promise((resolve, reject) => getImage(job.imageSequence[i], resolve, reject));
            let element = await createImageElement(imageData);
            imageListElement.append(element);
        } catch (ignored) {}
    }
    $('.carousel-item:first').addClass('active');
    $('#job-title').html(job.name);
    $(document).prop('title', 'Job - ' + job.name);

    //initialise carousel arrows
    updateCarouselArrows();
}

/**
 * processes adding a new image to a job
 * @param {Object} formData
 * @param {Object} imageData
 * @param {string} imageData.image_creator
 * @param {string} imageData.image_description
 * @param {string} imageData.image_title
 * @param {string} imageData.image_type
 * @param {Object} imageData.image_source
 * @param {string} jobId
 */
function addImage(formData, imageData, jobId) {
    saveJobImage(jobId, formData, imageData, null, (data) => newImageAdded(data._id), processImageCreationError);
}

/**
 * Hides left or right arrows if no images in that direction and if there are no more images to the right it shows the add button
 */
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

/**
 * creates an image HTML element for a job
 * @param {Object} image
 * @param {string} image.creator
 * @param {string} image.description
 * @param {string} image.id
 * @param {string} image.imageData
 * @param {string} image.title
 * @param {string} image.type
 * @param {string} image.url
 * @param {int} image.__v
 * @param {int} image._id
 * @returns {Object} imageElement
 */
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
                            <button type="submit" class="btn btn-dark btn-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" ><path d="M0 0h24v24H0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/></svg>
                            </button>
                        </div>
                    </form>
                </div>
                <hr>
                <div class="card-body">
                    <select class="form-control" id="knowledge-graph-type-${image._id}">
                        <option selected value="All">All</option>
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
                        <input id="knowledge-graph-search-${image._id}" type="text" class="form-control knowledge-graph-search" placeholder="Search knowledge graph...">
                        <div class="input-group-append">
                            <div class="btn btn-dark btn-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="#FFFFFF"><path d="M0 0h24v24H0z" fill="none"></path><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"></path></svg>
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

    //Updates the 'type' for which the knowledge uses to search
    let knowledgeGraphContainer = imageElement.find('#knowledge-graph-results-container-'+image._id);
    imageElement.find('#knowledge-graph-type-'+image._id).on("change load", function() {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'maxDescChars': 100,
            'selectHandler': (e) => { //Handles the knowledge graph search bar
                let JSONLD = e.row.json;
                let knowledgeGraphElement = createKnowledgeGraphElement(JSONLD, image._id, 'grey');
                $('#knowledge-graph-results-container-'+image._id).append(knowledgeGraphElement);
                sendNewKnowledgeGraph(JSONLD, image._id, 'grey');
            },
        };
        if (this.value !== "All") {
            config['types'] = [this.value];
        }
        KGSearchWidget(apiKey, imageElement.find('#knowledge-graph-search-'+image._id).get()[0], config);
    });
    imageElement.find('#knowledge-graph-type-'+image._id).trigger("load");
    if (!navigator.onLine) {
        imageElement.find('#knowledge-graph-search-'+image._id).prop('disabled', true);
    }

    let chatContainer = imageElement.find(".chat-container");
    chatContainer.empty();
    chats[image._id] = {
        container: chatContainer,
        chatButton: chatButton,
        prevMessage: null
    }

    let imageChat = (await getChatDataForImage(image._id)).chatData;
    imageChat.forEach(chatObj => newChatMessage(image._id, chatObj));

    let imageKnowledgeGraph = (await getKnowledgeGraphDataForImage(image._id)).knowledgeGraphData;
    imageKnowledgeGraph.forEach(knowledgeGraphObj => knowledgeGraphContainer.append(createKnowledgeGraphElement(knowledgeGraphObj.JSONLD, image._id, knowledgeGraphObj.color)));

    imageElement.find('#job-image').replaceWith(annotation.container);

    annotation.addButtons(imageElement.find('.card-header'));

    new MutationObserver(() => {
        if (imageElement.hasClass('active')) {
            chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
        }
    }).observe(imageElement.get(0), {attributeFilter: ['class'], attributeOldValue: true});

    return imageElement;
}

/**
 * creates a knowledge graph card/element from an object of properties
 * @param {Object} JSONLD
 * @param {string} JSONLD.@id
 * @param {string} JSONLD.name
 * @param {string} JSONLD.detailedDescription.articleBody
 * @param {string} JSONLD.url
 * @param {int} imageId
 * @param {string} color
 * @returns {Object} knowledgeGraphCard
 */
function createKnowledgeGraphElement(JSONLD, imageId, color) {
    let ID = JSONLD['@id'].replace(/[^a-zA-Z0-9]/g,'');
    let knowledgeGraphCard = $(`
        <div class="card knowledge-card" id="${ID}">
            <div class="card-body">
                <h5 class="card-title">${JSONLD.name}</h5>
                <p class="card-text">${JSONLD.detailedDescription ? JSONLD.detailedDescription.articleBody : JSONLD.description}</p>
                <a href="${JSONLD.url}" target="_blank" class="card-link"><button type="button" class="btn btn-info">Webpage</button></a>
            </div>
        </div>
    `);
    knowledgeGraphCard.css('border-color', color);
    $(`<a><span class="btn btn-success colorpicker-input-addon annotate">Annotate</span></a>`).appendTo(knowledgeGraphCard.find('.card-body')).on("colorpickerChange", (e) => {
        let color = e.color.toString()
        annotationClasses[imageId].colorPicker.setValue(e.color);
        knowledgeGraphCard.css('border-color', color);
        sendKnowledgeGraphColor(imageId, JSONLD['@id'], color)
    }).colorpicker({
        useAlpha: false
    }).children().removeClass('colorpicker-input-addon');
    $(`<button type="button" class="btn btn-danger ml-1 float-right"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
       </button>`).appendTo(knowledgeGraphCard.find('.card-body')).click(() => {
        knowledgeGraphCard.remove();
        sendKnowledgeGraphDeletion(imageId, JSONLD['@id']);
    });
    return knowledgeGraphCard;
}

/**
 * adds a chat message to the page
 * @param {Object} imageChat
 * @param {Object} imageChat.chatButton
 * @param {string} imageChat.container
 * @param {Object} messageElement
 */
function addMessage(imageChat, messageElement) {
    let scrollHeight = imageChat.container.prop('scrollHeight');
    let scrollPos = imageChat.container.scrollTop() + imageChat.container.innerHeight();
    const autoScroll = scrollHeight - scrollPos <= 0;
    imageChat.container.append(messageElement);
    if (autoScroll) {
        imageChat.container.scrollTop(scrollHeight);
    }
}

/**
 * handles an incoming socket.io event of a new message
 * @param {int} imageId
 * @param {Object} chatObj
 * @param {string} chatObj.message
 * @param {string} chatObj.sender
 */
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

/**
 * removes a chat bobble
 * @param {int} imageId
 * @param {string} sender
 */
function removeBobble(imageId, sender) {
    if (currentlyTyping[imageId] && currentlyTyping[imageId][sender]) {
        clearTimeout(currentlyTyping[imageId][sender].timeout);
        currentlyTyping[imageId][sender].bobber.remove();
        delete currentlyTyping[imageId][sender];
    }
}

/**
 * adds a chat bobble
 * @param {int} imageId
 * @param {string} sender
 */
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

/**
 * handles an incoming socket.io event of a new knowledge graph element
 * @param {Object} JSONLD
 * @param {string} JSONLD.@id
 * @param {string} JSONLD.name
 * @param {string} JSONLD.detailedDescription.articleBody
 * @param {string} JSONLD.url
 * @param {int} imageId
 * @param {string} color
 */
export function newKnowledgeGraph(JSONLD, imageId, color) {
    let knowledgeGraphElement = createKnowledgeGraphElement(JSONLD, imageId, color);
    $('#knowledge-graph-results-container-'+imageId).append(knowledgeGraphElement);
}

/**
 * handles an incoming socket.io event of colour for a knowledge graph element
 * @param {int} imageId
 * @param {string} graphId
 * @param {string} color
 */
export function updateKnowledgeGraphColor(imageId, graphId, color) {
    graphId = graphId.replace(/[^a-zA-Z0-9]/g,'');
    $('#knowledge-graph-results-container-'+imageId+' #'+graphId).css('border-color', color);
}

/**
 * handles an incoming socket.io event of the removal of a knowledge graph element
 * @param {int} imageId
 * @param {string} graphId
 */
export function deleteKnowledgeGraph(imageId, graphId) {
    graphId = graphId.replace(/[^a-zA-Z0-9]/g,'');
    $('#knowledge-graph-results-container-'+imageId+' #'+graphId).remove();
}

/**
 * handles the image creation error
 * @param {Object} e
 */
function processImageCreationError(e) {
    $("#addImage").append(error(e['responseJSON'].error));
}

/**
 * closes and clears modal form and moves the carousel to the new image
 * @param {int} imageId
 */
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