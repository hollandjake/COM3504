// On load
import {addImage, joinJob} from "./jobSocket.js";

$(function () {
    let jobID;

    $.ajax({
        type: 'get',
        url: window.location.pathname+'/list',
        success: function (job) {
            let imageListElement = $('#image-container');

            imageListElement.empty();

            job.imageSequence.forEach(image => {
                try {
                    let element = createImageElement(image);
                    imageListElement.append(element);
                } catch (e) {}
            })

            $('.carousel-item:first').addClass('active');
            $('#job-title').html(job.name);
            $(document).prop('title', 'Job - '+job.name);

            jobID = job.id;
            joinJob(jobID);

            //initialise carousel arrows
            updateCarouselArrows();
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
            let file = files[0];
            let fr = new FileReader();
            fr.onload = () => {
                inputs['url'] = fr.result;
                addImage(inputs, jobID);
            }
            if (file) {
                fr.readAsDataURL(file);
            } else {
                processImageCreationError('Failed to add Image');
            }
        } else {
            await addImage(inputs, jobID);
        }
    })

    $('#imageCarousel').carousel({
        wrap: false
    }).on('slid.bs.carousel', function () {
        updateCarouselArrows();
    });
})

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

export function createImageElement(image) {
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

export function processImageCreationError(errorMessage) {
    $("#addImage").append($('<div class="alert alert-warning alert-dismissible fade show modal-dialog" role="alert">\n' +
        `  <strong>Holy guacamole!</strong> ${errorMessage}` +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>'));
}

//Closes and clears modal form and moves the carousel to the new image
export function newImageAdded() {
    $('#addImage').modal('hide').end().trigger("reset");
    $('#imageCarousel').carousel($('#image-container .carousel-item').length-1);
}