// On load
import {joinJob} from "./jobSocket.js";
import {loadImage} from "../components/preloadImage.js";
import {error} from "../components/error.js";
import {getPID, storeNewImage, storeJob, getJob} from "../databases/indexedDB.js";

$(async function () {
    let jobLocal = await getJob(jobID);
    if (jobLocal) {
        await initialisePage(jobLocal);
    }

    $.ajax({
        type: 'get',
        url: window.location.pathname+'/list',
        success: async function (job) {
            //Simple check if the job fetched from mongoDB is newer, this may need changing when annotations/chat is implemented
            if (jobLocal) {
                if (job.imageSequence.length !== jobLocal.imageSequence.length) {
                    await initialisePage(job);
                    await storeJob(job);
                }
            } else {
                await initialisePage(job);
                await storeJob(job);
            }
        }
    });


    $('#addImage').submit(async function(e) {
        e.preventDefault();

        let inputs = {};
        $.each($('#addImage').serializeArray(), function(i, field) {
            inputs[field.name] = field.value;
        });

        if (!inputs['url']) {
            let files = $('#inputImageUpload').prop('files');
            inputs['image_file'] = files[0];
        }
        await addImage(inputs, jobID);
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
        } catch (e) {}
    }

    $('.carousel-item:first').addClass('active');
    $('#job-title').html(job.name);
    $(document).prop('title', 'Job - '+job.name);

    joinJob(jobID);

    //initialise carousel arrows
    updateCarouselArrows();
}

async function addImage(inputs, jobID) {
    let formData = new FormData();
    formData.append('image_title', inputs['title']);
    formData.append('image_author', inputs['author']);
    formData.append('image_description', inputs['description']);
    formData.append('image', inputs['image_file']);
    formData.append('image_url', inputs['url']);
    formData.append('invoker', await getPID('name'))

    $.ajax({
        type: 'POST',
        url: `/job/${jobID}/add-image`,
        data: formData,
        processData: false,
        contentType: false,
        error: function(e) {
            processImageCreationError(e.responseJSON);
        }
    })
}



//Hides left or right arrows if no images in that direction and if there are no more images to the right it shows the add button
function updateCarouselArrows() {
    let curSlide = $('.active');
    if(curSlide.is( ':first-child' )) {
        $('.left').hide();
    } else {
        $('.left').css('display', 'flex');
    }
    if (curSlide.is( ':last-child' )) {
        $('.right').hide();
        $('.add').css('display', 'flex');
    } else {
        $('.right').css('display', 'flex');
        $('.add').hide();
    }
}

async function createImageElement(image) {
    await loadImage(image.imageUrl);
    return $(`
        <div class="carousel-item">
            <div class="card w-50 mx-auto">
                <img src="${image.imageUrl}" class="card-img-top job-image" alt="${image.title}">
                <div class="card-body">
                    <h5 class="card-title">${image.title}</h5>
                    <p class="card-text"> <small class="text-muted">By ${image.author}</small></p>
                    <p class="card-text">${image.description}</p>
                </div>
            </div>
            <div class="card-text card w-50 mx-auto mt-2 text-box">
                <div class="overflow-auto d-inline-block">
                    <table class="table table-striped mb-0 w-100">
                        <tbody class="w-100">
                            <tr>
                                <th scope="row">Tom:</th>
                                <td class="w-100">Wow great picture</td>
                            </tr>
                            <tr>
                                <th scope="row">Billy:</th>
                                <td>Lets discover the clues!</td>
                            </tr>
                            <tr>
                                <th scope="row">Jake:</th>
                                <td>I am Sherlock Holmes</td>
                            </tr>
                            <tr>
                                <th scope="row">Jake:</th>
                                <td>I am Sherlock Holmes</td>
                            </tr>
                            <tr>
                                <th scope="row">Jake:</th>
                                <td>I am Sherlock Holmes</td>
                            </tr>
                            <tr>
                                <th scope="row">Jake:</th>
                                <td>I am Sherlock Holmes</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="card-footer">
                    <form>
                        <div class="input-group container pt-2">
                            <input name="message" type="text" class="form-control" placeholder="Type here">
                            <div class="input-group-append">
                                <div class="btn btn-dark">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/></svg>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `);
}

function processImageCreationError(data) {
    $("#addImage").append(error(data.error));
}

//Closes and clears modal form and moves the carousel to the new image
export async function newImageAdded(data) {
    try {
        await storeNewImage(jobID,data.image);
        let element = await createImageElement(data.image);
        if (element) {
            $('#image-container').append(element);
            updateCarouselArrows();
        }
        if (data.invoker === await getPID('name')) {
            $('#addImage').modal('hide').trigger("reset");
            $('#imageCarousel').carousel($('#image-container .carousel-item').length-1);
        }
    } catch (e) {
        processImageCreationError({
            error: "Something went wrong"
        })
        console.log(e);
    }
}