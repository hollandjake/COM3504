import {getPID} from "../databases/indexedDB.js";

$(() => {
    const radioButtons = $('[data-for="image-source"]');
    const urlField = $('[data-for="url"]');
    const uploadField = $('[data-for="upload"]');
    const cameraField = $('[data-for="camera"]');
    const cameraPreview = $('[data-for="camera"] video');
    const cameraPreviewError = $('[data-for="camera"] .error-box');
    const urlPreview = $('[data-for="url"] img');
    const urlPreviewError = $('[data-for="url"] .error-box');
    const uploadPreview = $('[data-for="upload"] img');
    const uploadPreviewError = $('[data-for="upload"] .error-box');

    let activeTool;
    let stream;

    $('.modal').on('hidden.bs.modal', async function(e) {
        if (activeTool === "camera") {
            killCam(cameraPreview);
        }
    }).on('show.bs.modal', async function(e) {
        if (activeTool ===  "camera") {
            radioButtons.filter('[data-type="camera"]').click();
        }
    })

    radioButtons.click(async function (e) {
        e.preventDefault();
        radioButtons.removeClass('active');
        $(this).addClass('active');

        let imageType = $(this).attr("data-type");
        activeTool = imageType;
        if (imageType === "url") {
            killCam(cameraPreview);
            urlField.addClass('d-block').removeClass('d-none');
            uploadField.addClass('d-none').removeClass('d-block');
            cameraField.addClass('d-none').removeClass('d-block');
        } else if (imageType === "upload") {
            killCam(cameraPreview);
            urlField.addClass('d-none').removeClass('d-block');
            uploadField.addClass('d-block').removeClass('d-none');
            cameraField.addClass('d-none').removeClass('d-block');
        } else if (imageType === "camera") {
            let cameraAvailable = await loadCam(cameraPreview);
            urlField.addClass('d-none').removeClass('d-block');
            uploadField.addClass('d-none').removeClass('d-block');
            cameraField.addClass('d-block').removeClass('d-none');

            if (cameraAvailable) {
                cameraPreview.removeClass('d-none');
                cameraPreviewError.addClass('d-none');
            } else {
                cameraPreview.addClass('d-none');
                cameraPreviewError.removeClass('d-none');
            }
        }
    })

    $('.modal [data-name="url"]').on('input change', function (e) {
        const url = $(e.target).val();
        urlPreview.on('load', function () {
            urlPreview.removeClass('d-none');
            urlPreviewError.addClass('d-none');
        }).on('error', function () {
            urlPreview.addClass('d-none');
            urlPreviewError.removeClass('d-none');
        });
        urlPreview.attr('src', url);
    });

    $('.modal [data-name="upload"]').on('input change', function (e) {
        const file = URL.createObjectURL($(e.target).prop('files')[0]);
        uploadPreview.on('load', function () {
            uploadPreview.removeClass('d-none');
            uploadPreviewError.addClass('d-none');
        }).on('error', function () {
            uploadPreview.addClass('d-none');
            uploadPreviewError.removeClass('d-none');
        });
        uploadPreview.attr('src', file);
    });

    async function loadCam(videoElement) {
        videoElement.hide();
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        exact: "environment"
                    }
                },
                audio: false
            });
        } catch (ignored) {
        }

        try {
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            }
        } catch (ignored) {
        }

        if (stream) {
            let videoObject = videoElement.get()[0];
            videoObject.srcObject = stream;
            videoObject.play();
            videoObject.addEventListener('canplay', function () {
                videoElement.show();
            })
            return true;
        } else {
            return false;
        }
    }

    async function killCam(videoElement) {
        videoElement.hide();
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }
})

export async function getModalData(modal, extraFields = {}) {
    let finalData = {};

    Object.keys(extraFields).forEach((key) => finalData[key] = extraFields[key]);

    let inputs = {};
    $.each(modal.serializeArray(), function (i, field) {
        inputs[field.name] = field.value;
        finalData[field.name] = field.value;
    });

    finalData['image_creator'] = await getPID('name');

    if (modal.find('[data-for="url"]').hasClass('d-block')) {
        finalData['image_type'] = 'url';
        finalData['image_source'] = modal.find('[data-name="url"]').val();

    } else if (modal.find('[data-for="upload"]').hasClass('d-block')) {
        finalData['image_type'] = 'upload';
        finalData['image_source'] = modal.find('[data-name="upload"]').prop('files')[0];

    } else if (modal.find('[data-for="camera"]').hasClass('d-block')) {
        let videoElement = modal.find('[data-name="camera"]').get()[0];

        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0);

        finalData['image_type'] = 'camera';
        finalData['image_source'] = canvas.toDataURL('image/png');
        canvas.remove();
    }

    const formData = new FormData();
    Object.keys(finalData).forEach(key => formData.append(key, finalData[key]));

    return formData;
}