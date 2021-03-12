export const loadImage = (src, alt, classes) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        let imageObject = $(img);
        imageObject.addClass(classes);
        imageObject.attr('alt', alt);
        img.onload = () => resolve(imageObject);
        img.onerror = reject;
        img.src = src;
    })