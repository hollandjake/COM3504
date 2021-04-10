const job = io.connect('/job');

export function sendChat(image_id, message) {
    let jobID = JOB_ID;
    let userID = document.getElementById('nav-name').innerHTML;

    job.emit('chat', jobID, userID, message, image_id);
}