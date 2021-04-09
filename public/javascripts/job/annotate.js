import {loadImage} from "../components/preloadImage.js";
import {annotations} from "./job.js";
import {updateImageWithAnnotations} from "../databases/indexedDB.js";
const job = io.connect('/job');



$(function () {


    job.emit('join', JOB_ID);
    job.on('draw', function (annotationID, e, funcName) {
        let currAnn = annotations.find(item => item._image_id === annotationID);
        switch (funcName) {
            case "startDrawing":
                currAnn.startDrawing(e);
                break;
            case "endDrawing":
                currAnn.endDrawing(e);
                break;
            case "onDrag":
                currAnn.onDrag(e);
                break;
            case "updateSize":
                currAnn.updateSize();
                break;
            case "networkEvent":
                //console.log(e);
                currAnn.onNetworkEvent(e);
                break;
        }
    });

})


export default class Annotate {
    constructor(image, imageClasses, containerClasses) {
        this._image = image;
        this._imageClasses = imageClasses;
        this._containerClasses = containerClasses;
    }

    get container() {
        return this._container;
    }

    get draw() {
        return this._draw;
    }

    async init() {
        const [container, canvas, ctx, imageSize, imageId] = await this.createCanvas(this._image, this._imageClasses, this._containerClasses);
        this._container = container;
        this._canvas = canvas;
        this._draw = ctx;
        this._nativeResolution = imageSize;
        this._image_id = imageID;
        this._renderResolution = null;
        this._is_drawing = false;
        this._prevPoint = null;
        this._color = "#FF0000";
        this._size = 10;
        this._scheduledSave = null;
        this.initEvents();
        return this;
    }

    async createCanvas(image, imageClasses, containerClasses) {
        const imageObject = await loadImage(image.imageUrl, image.title, imageClasses);

        const annotationContainer = $(`<div class="annotation-container ${containerClasses}"></div>`);

        let width = imageObject.width;
        let height = imageObject.height;

        let canvas = document.createElement("canvas");
        canvas.classList = imageClasses;
        let ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        canvas.style.maxWidth = width + "px";
        canvas.style.maxHeight = height + "px";
        imageObject.style.maxWidth = canvas.style.maxWidth;
        imageObject.style.maxHeight = canvas.style.maxHeight;

        if (image.annotationData) {
            let imageDOM = new Image();
            imageDOM.onload = function () {
                ctx.drawImage(imageDOM, 0,0);
                annotationContainer.append($(imageObject));
                annotationContainer.append($(canvas));
            }
            imageDOM.src = image.annotationData;
        } else {
            annotationContainer.append($(imageObject));
            annotationContainer.append($(canvas));
        }

        return [annotationContainer, canvas, ctx, {width: width, height: height}];
    }

    initEvents() {
        const annotation = this;
        try {

            /*
            node.addEventListener('mousedown', (e) => job.emit('draw', annotation._image_id, {pageX: e.pageX, pageY: e.pageY}, JOB_ID, 'startDrawing'));
            node.addEventListener('mouseup', (e) => job.emit('draw', annotation._image_id, {pageX: e.pageX, pageY: e.pageY}, JOB_ID, 'endDrawing'));
            node.addEventListener('mouseleave', (e) => job.emit('draw', annotation._image_id, {pageX: e.pageX, pageY: e.pageY}, JOB_ID, 'endDrawing'));
            node.addEventListener('mousemove', (e) => job.emit('draw', annotation._image_id, {pageX: e.pageX, pageY: e.pageY}, JOB_ID, 'onDrag'));
            node.addEventListener('resize', (e) => job.emit('draw', annotation._image_id, {pageX: e.pageX, pageY: e.pageY}, JOB_ID, 'updateSize'));
            this.eventNode.addEventListener('startDrawing', (e) => job.emit('draw', annotation._image_id, {detail: {type: e.detail.type, data: e.detail.data, id: e.detail.id, color: e.detail.color}}, JOB_ID, 'networkEvent'));
            this.eventNode.addEventListener('endDrawing', (e) => job.emit('draw', annotation._image_id, {detail: {type: e.detail.type, data: e.detail.data, id: e.detail.id, color: e.detail.color}}, JOB_ID, 'networkEvent'));
            this.eventNode.addEventListener('onDraw', (e) => job.emit('draw', annotation._image_id, {detail: {type: e.detail.type, data: e.detail.data, id: e.detail.id, color: e.detail.color}}, JOB_ID, 'networkEvent'));
             */

            this._canvas.addEventListener('mousedown', (e) => annotation.startDrawing(e));
            this._canvas.addEventListener('touchstart', (e) => annotation.startDrawing(e));
            this._canvas.addEventListener('mouseup', (e) => annotation.endDrawing(e));
            this._canvas.addEventListener('touchend', (e) => annotation.endDrawing(e));
            this._canvas.addEventListener('touchcancel', (e) => annotation.endDrawing(e));
            this._canvas.addEventListener('mouseleave', (e) => annotation.endDrawing(e));
            this._canvas.addEventListener('mousemove', (e) => annotation.onDrag(e));
            this._canvas.addEventListener('touchmove', (e) => annotation.onDrag(e));
            this._canvas.addEventListener('resize', (e) => annotation.updateSize());
            this._canvas.addEventListener('startDrawing', (e) => annotation.onNetworkEvent(e));
            this._canvas.addEventListener('onDraw', (e) => annotation.onNetworkEvent(e));
        } catch (e) {
            console.log(e);
        }
    }

    startDrawing(e) {
        e.preventDefault();
        if (!this._is_drawing) {
            this._is_drawing = true;
            const point = this.getPoint(e);

            this._canvas.dispatchEvent(new CustomEvent('startDrawing', {
                detail: {
                    type: 'point',
                    pos: point,
                    fillStyle: this._color,
                    size: this._size
                }
            }));
            this._prevPoint = point;
        }
    }

    endDrawing(e) {
        e.preventDefault();
        if (this._is_drawing) {
            this._is_drawing = false;
            this._prevPoint = null;
        }
    }

    onDrag(e) {
        e.preventDefault();
        if (this._is_drawing) {
            const point = this.getPoint(e);
            this._canvas.dispatchEvent(new CustomEvent('onDraw', {
                detail: {
                    type: 'line',
                    start: this._prevPoint,
                    end: point,
                    strokeStyle: this._color,
                    size: this._size
                }
            }));
            this._prevPoint = point;
        }
    }

    onNetworkEvent(event) {
        event = event.detail;

        if (event.type === 'point') {
            this._draw.fillStyle = event.fillStyle;
            this._draw.fillRect(event.pos.x, event.pos.y, event.size, event.size);
        } else if (event.type === 'line') {
            this._draw.strokeStyle = event.strokeStyle;
            this._draw.translate(0.5, 0.5);
            this._draw.beginPath();
            this._draw.lineCap = 'round';
            this._draw.lineWidth = event.size;
            this._draw.moveTo(event.start.x,event.start.y);
            this._draw.lineTo(event.end.x,event.end.y);
            this._draw.stroke();
            this._draw.translate(-0.5, -0.5);
        }

        if (this._scheduledSave) {
            clearTimeout(this._scheduledSave);
            this._scheduledSave = null;
        }
        this._scheduledSave = setTimeout(() => {
            let data = this._canvas.toDataURL();
            this._image.annotationData = data;
            updateImageWithAnnotations(JOB_ID, this._image);
        }, 1000); //Save after a second of inactivity
    }

    getPoint(e) {
        this.updateSize();
        let pos = {x: e.pageX, y: e.pageY};
        if (e instanceof TouchEvent) {
            pos = {x: e.touches[0].pageX, y: e.touches[0].pageY}
        }
        return {
            x: (pos.x - this._renderResolution.left) * (this._nativeResolution.width / this._renderResolution.width),
            y: (pos.y - this._renderResolution.top) * (this._nativeResolution.height / this._renderResolution.height)
        }
    }

    updateSize() {
        this._renderResolution = this._canvas.getBoundingClientRect();
    }
}