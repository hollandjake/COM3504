import {loadImage} from "../components/preloadImage.js";

export default class Annotate {
    constructor(imageUrl, containerClasses) {
        this._imageUrl = imageUrl;
        this._containerClasses = containerClasses;
    }

    async init() {
        const [container, canvas, ctx] = await this.createCanvas(this._imageUrl);
        this._container = container;
        this._container.addClass(this._containerClasses);
        this._canvas = canvas;
        this._ctx = ctx;
        return this;
    }

    async createCanvas(imageUrl, classes) {
        const imageObject = await loadImage(imageUrl, '', '');

        const annotationContainer = $(`<div class="annotation-container ${classes}"></div>`);
        const canvas = document.createElement('canvas');
        canvas.width = imageObject.width;
        canvas.height = imageObject.height;
        canvas.style.width = "100%";
        annotationContainer.append($(canvas));
        const ctx = canvas.getContext('2d');

        ctx.drawImage(imageObject,0,0, imageObject.width, imageObject.height);

        return [annotationContainer, $(canvas), ctx];
    }

    get container() {
        return this._container;
    }
}