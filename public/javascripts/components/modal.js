import {getPID} from "../databases/indexedDB.js";

$(() => {
    const radioButtons = $('[data-for="image-source"]');
    const urlField = $('[data-for="url"]');
    const uploadField = $('[data-for="upload"]');
    const cameraField = $('[data-for="camera"]');
    const videoSource = $('[data-for="camera"] video');

    let stream;

    radioButtons.click(async function (e) {
        e.preventDefault();
        radioButtons.removeClass('active');
        $(this).addClass('active');

        let imageType = $(this).attr("data-type");
        if (imageType === "url") {
            killCam(videoSource);
            urlField.addClass('d-block').removeClass('d-none');
            uploadField.addClass('d-none').removeClass('d-block');
            cameraField.addClass('d-none').removeClass('d-block');
        } else if (imageType === "upload") {
            killCam(videoSource);
            urlField.addClass('d-none').removeClass('d-block');
            uploadField.addClass('d-block').removeClass('d-none');
            cameraField.addClass('d-none').removeClass('d-block');
        } else if (imageType === "camera") {
            let cameraAvailable = await loadCam(videoSource);
            urlField.addClass('d-none').removeClass('d-block');
            uploadField.addClass('d-none').removeClass('d-block');
            cameraField.addClass('d-block').removeClass('d-none');

            if (cameraAvailable) {
                $(videoSource).removeClass('d-none');
                cameraField.find('.error-box').addClass('d-none');
            } else {
                $(videoSource).addClass('d-none');
                cameraField.find('.error-box').removeClass('d-none');
            }
        }
    })

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