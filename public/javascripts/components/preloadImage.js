export const loadImage = (src, alt, classes) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        let imageObject = $(img);
        if (classes) imageObject.addClass(classes);
        if (alt) imageObject.attr('alt', alt);
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

export const getImageAsBase64 = async (imageData) => {

    if ((/(data:image\/.+)/).test(imageData)) {
        return imageData
    }

    const data = await axios.get(imageData, {responseType: "arraybuffer"});

    const base64 = Buffer.from(data.data).toString("base64");
    return "data:" + data.headers["content-type"] + ";base64," + base64;
}
