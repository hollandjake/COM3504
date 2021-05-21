/**
 * Preloads an image and applies optional styling to the element
 * (this element is not rendered on the DOM)
 * @param {string} src - the image source, can be a url or a base64 string
 * @param {string} [alt] - the image alt to be added (optional)
 * @param {string} [classes] - the classes to be added to the image (optional)
 * @returns {Promise<HTMLImageElement>} - the HTMLImageElement with the image data loaded into memory
 */
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

/**
 * Extracts an image into its base64 counterpart this can handle any url.
 * @param {string} imageData - the image source, can be a url or a base64 string
 * @returns {Promise<string>} - the base64 string representing the imageData
 */
export const getImageAsBase64 = async (imageData) => {

    if ((/(data:image\/.+)/).test(imageData)) {
        return imageData
    }

    const data = await axios.get(imageData, {responseType: "arraybuffer"});

    const base64 = Buffer.from(data.data).toString("base64");
    return "data:" + data.headers["content-type"] + ";base64," + base64;
}
