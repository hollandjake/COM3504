const job = io.connect('/job');
let currentPage = 0

function sendChat() {
    console.log(currentPage);
    let jobID = parseInt(JOB_ID);
    let userID = document.getElementById('nav-name').innerHTML;
    let message = document.getElementsByName('chatmessage')[currentPage].value;
    job.emit('chat', jobID, userID, message, currentPage);
}

function nextJob() {
currentPage += 1;
}

function prevJob() {
currentPage -= 1;
}