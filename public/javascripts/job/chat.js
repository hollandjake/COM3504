const job = io.connect('/job');
let currentPage = 0

let forwardSlide = false;
let prevSlide = false;

$(document).ready(function() {
    $('#imageCarousel').on('slide.bs.carousel', function (e) {
        if (forwardSlide) {
            currentPage += 1;
        } else if (prevSlide) {
            currentPage -= 1;
        }
        forwardSlide = false;
        prevSlide = false;
        console.log(currentPage);
    })

});

function sendChat() {
    console.log(currentPage);
    let jobID = parseInt(JOB_ID);
    let userID = document.getElementById('nav-name').innerHTML;
    let message = document.getElementsByName('chatmessage')[currentPage].value;
    job.emit('chat', jobID, userID, message, currentPage);
}

function nextJob() {
    forwardSlide = true;
}

function prevJob() {
    prevSlide = true;
}