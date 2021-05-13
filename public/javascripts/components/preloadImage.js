export const loadImage = (src, alt, classes) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        let imageObject = $(img);
        if (classes) imageObject.addClass(classes);
        if (alt) imageObject.attr('alt', alt);
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    })