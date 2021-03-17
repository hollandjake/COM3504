$(function () {
    // Used in the form to add a job to switch between uploading an image and entering the URL
    $('#useImageURL').change(function(){
        $('#inputImageURLGroup').toggleClass('d-block d-none');
        $('#inputImageUploadGroup').toggleClass('d-none d-block');
    });
    $('#useImageUpload').change(function(){
        $('#inputImageURLGroup').toggleClass('d-none d-block');
        $('#inputImageUploadGroup').toggleClass('d-block d-none');
    });
})