const job = io.connect('/job');

function sendChat(image_id) {
    let jobID = parseInt(JOB_ID);
    let userID = document.getElementById('nav-name').innerHTML;
    let message = document.getElementById('message'+image_id).value;

    job.emit('chat', jobID, userID, message, image_id);
}

function sendEnterChat(image_id, e) {
    if(e.key == "Enter") {
        let jobID = parseInt(JOB_ID);
        let userID = document.getElementById('nav-name').innerHTML;
        let message = document.getElementById('message'+image_id).value;

        job.emit('chat', jobID, userID, message, image_id);
    }

}

