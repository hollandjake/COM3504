// On load
$(function () {
    loadName();

    //Ajax call to get the list of jobs
    $.ajax({
        type: 'get',
        url: '/job/list',
        success: function (jobsData) {
            let jobListElement = $('#job-list-container');

            jobListElement.empty(); //Remove the child nodes

            if (!jobsData || jobsData.length === 0) {
                let element = $(`<div class="card">` +
                    '<div class="card-body">' +
                    `<h5 class="card-text mb-0 text-center">No Jobs Available</h5>` +
                    '</div>' +
                    '</div>');
                element.fadeOut(0);
                jobListElement.removeClass('card-columns');
                jobListElement.append(element);
                element.fadeIn(500);
            } else {
                jobListElement.addClass('card-columns');
                jobsData.forEach(async job => {
                    let element = await createJobElement(job);
                    element.fadeOut(0);
                    jobListElement.append(element);
                    element.fadeIn(500);
                })
            }
        }
    })
})

//Preloads the image so that the browser doesnt reflow the content
const loadImage = (src, alt, classes) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        let imageObject = $(img);
        imageObject.addClass(classes);
        imageObject.attr('alt', alt);
        img.onload = () => resolve(imageObject);
        img.onerror = reject;
        img.src = src;
    })
;

async function createJobElement(job) {
    let image = await loadImage(job.imageSequence[0].imageUrl, job.name, "card-img-top");

    let element = $(`<div class="card">` +
        '<div class="card-body">' +
        `<h5 class="card-text mb-0">${job.name}</h5>` +
        `<a href="/job/${job.id}" class="stretched-link"></a>` +
        '</div>' +
        '</div>');
    element.prepend(image);
    return element;
}

async function loadName() {
    // Get name from IndexedDB and show it on the nav bar
    let name = await getPID('name');
    if (name) {
        let nameElement = $('#nav-name');
        nameElement.text(name);
        nameElement.toggleClass('invisible visible');
    } else {
        window.location.replace('/login');
    }
}