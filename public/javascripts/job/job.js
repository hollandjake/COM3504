// On load
import {addImage, joinJob} from "./jobSocket.js";

$(function () {
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
                addImage(inputs);
            }
            if (file) {
                fr.readAsDataURL(file);
            } else {
                processImageCreationError('Failed to add Image');
            }
        } else {
            addImage(inputs);
        }
    })

    joinJob();
})

export async function createImageElement(image) {
    let element = $(`<div class="carousel-item">
                <div class="card w-50 mx-auto">
                    <img src="${image.imageUrl}" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${image.title} </h5>
                        <p class="card-text"> <small class="text-muted"> ${image.author} </small></p>
                        <p class="card-text">${image.description} </p>
                        <div class="card-text card">
                            <div class="card-body">
                                <div class="card-text">
                                    text
                                </div>
                                <div class="card-text">
                                    text2
                                </div>
                            </div>
                            <div class="card-footer">
                                <form>
                                    <div class="input-group container pt-2">
                                        <input name="message" type="text" class="form-control" placeholder="Type here">
                                        <div class="input-group-append">
                                            <div class="btn btn-dark">
                                                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24"
                                                     height="24" viewBox="0 0 24 24" width="24">
                                                    <g>
                                                        <rect fill="none" height="24" width="24"/>
                                                    </g>
                                                    <g>
                                                        <g>
                                                            <circle fill="white" cx="10" cy="8" r="4"/>
                                                            <path fill="white"
                                                                  d="M10.35,14.01C7.62,13.91,2,15.27,2,18v2h9.54C9.07,17.24,10.31,14.11,10.35,14.01z"/>
                                                            <path fill="white"
                                                                  d="M19.43,18.02C19.79,17.43,20,16.74,20,16c0-2.21-1.79-4-4-4s-4,1.79-4,4c0,2.21,1.79,4,4,4c0.74,0,1.43-0.22,2.02-0.57 L20.59,22L22,20.59L19.43,18.02z M16,18c-1.1,0-2-0.9-2-2c0-1.1,0.9-2,2-2s2,0.9,2,2C18,17.1,17.1,18,16,18z"/>
                                                        </g>
                                                    </g>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>`);

    return element;
}

export function processImageCreationError(errorMessage) {
    $("#addImage").append($('<div class="alert alert-warning alert-dismissible fade show modal-dialog" role="alert">\n' +
        `  <strong>Holy guacamole!</strong> ${errorMessage}` +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>'));
}

export function closeForm() {
    $('#addImage').modal('hide');
    $('#addImage').trigger("reset");
}