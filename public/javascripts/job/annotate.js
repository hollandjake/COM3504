import {loadImage} from "../components/preloadImage.js";
import {updateImageWithAnnotations} from "../databases/indexedDB.js";
import {sendAnnotation} from "./jobSocket.js";

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
        const [container, canvas, ctx, imageSize] = await this.createCanvas(this._image, this._imageClasses, this._containerClasses);
        this._container = container;
        this._canvas = canvas;
        this._draw = ctx;
        this._nativeResolution = imageSize;
        this._renderResolution = null;
        this._is_drawing = false;
        this._prevPoint = null;
        this._startPoint = null;
        this._scheduledSave = null;
        this._currentTool = {
            thickness: 3,
            color: "#000"
        };
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

        if (image.annotationData) {
            let imageDOM = new Image();
            imageDOM.onload = function () {
                ctx.drawImage(imageDOM, 0, 0);
            }
            imageDOM.src = image.annotationData;
        }

        annotationContainer.append($(imageObject));
        annotationContainer.append($(canvas));

        return [annotationContainer, canvas, ctx, {width: width, height: height}];
    }

    initEvents() {
        const annotation = this;
        try {
            this._canvas.addEventListener('mousedown', (e) => annotation.startDrawing(e));
            this._canvas.addEventListener('touchstart', (e) => annotation.startDrawing(e));
            this._canvas.addEventListener('mouseup', (e) => annotation.endDrawing(e));
            this._canvas.addEventListener('touchend', (e) => annotation.endDrawing(e));
            this._canvas.addEventListener('touchcancel', (e) => annotation.endDrawing(e));
            this._canvas.addEventListener('mouseleave', (e) => annotation.endDrawing(e));
            this._canvas.addEventListener('mousemove', (e) => annotation.onDrag(e));
            this._canvas.addEventListener('touchmove', (e) => annotation.onDrag(e));
            this._canvas.addEventListener('resize', (e) => annotation.updateSize());
            this._canvas.addEventListener('pointerup', (e) => e.stopImmediatePropagation());
        } catch (e) {
            console.log(e);
        }
    }

    startDrawing(e) {
        e.preventDefault();
        if (!this._is_drawing) {
            this._is_drawing = true;
            const point = this.getPoint(e);

            switch (this._currentTool.type) {
                case "line":
                    sendAnnotation(this._image._id, {
                        type: this._currentTool.type,
                        color: this._currentTool.color,
                        thickness: this._currentTool.thickness,
                        start: point,
                        end: point
                    })
                    break;
                case "eraser":
                    sendAnnotation(this._image._id, {
                        type: this._currentTool.type,
                        color: "rgba(0,0,0,1)",
                        thickness: this._currentTool.thickness,
                        start: point,
                        end: point
                    })
                    break;
            }
            this._startPoint = point;
            this._prevPoint = point;
        }
    }

    endDrawing(e) {
        e.preventDefault();
        if (this._is_drawing) {
            switch (this._currentTool.type) {
                case "arrow":
                    sendAnnotation(this._image._id, {
                        type: this._currentTool.type,
                        color: this._currentTool.color,
                        thickness: this._currentTool.thickness,
                        start: this._startPoint,
                        end: this.getPoint(e),
                        headLength: this._currentTool.thickness * 3
                    });
                    break;
                case "box":
                case "oval":
                    sendAnnotation(this._image._id, {
                        type: this._currentTool.type,
                        color: this._currentTool.color,
                        thickness: this._currentTool.thickness,
                        start: this._startPoint,
                        end: this.getPoint(e)
                    })
                    break;
            }
            this._is_drawing = false;
            this._prevPoint = null;
            this._startPoint = null;
        }
    }

    onDrag(e) {
        e.stopImmediatePropagation();
        if (this._is_drawing) {
            const point = this.getPoint(e);
            switch (this._currentTool.type) {
                case "line":
                    sendAnnotation(this._image._id, {
                        type: this._currentTool.type,
                        color: this._currentTool.color,
                        thickness: this._currentTool.thickness,
                        start: this._prevPoint,
                        end: point
                    });
                    break;
                case "eraser":
                    sendAnnotation(this._image._id, {
                        type: this._currentTool.type,
                        color: "rgba(0,0,0,1)",
                        thickness: this._currentTool.thickness,
                        start: this._prevPoint,
                        end: point
                    });
                    break;
            }
            this._prevPoint = point;
        }
    }

    onNetworkEvent(event) {
        this._draw.translate(0.5, 0.5);
        this._draw.beginPath();
        this._draw.strokeStyle = event.color;
        this._draw.lineWidth = event.thickness;
        this._draw.globalCompositeOperation = 'source-over';
        switch (event.type) {
            case 'eraser':
                this._draw.globalCompositeOperation = 'destination-out';
                this._draw.lineCap = 'round';
                this._draw.moveTo(event.start.x, event.start.y);
                this._draw.lineTo(event.end.x, event.end.y);
                break;
            case 'line':
                this._draw.lineCap = 'round';
                this._draw.moveTo(event.start.x, event.start.y);
                this._draw.lineTo(event.end.x, event.end.y);
                break;
            case 'arrow':
                const headLength = event.headLength ? event.headLength : 10;
                const dx = event.end.x - event.start.x;
                const dy = event.end.y - event.start.y;
                const angle = Math.atan2(dy, dx);
                this._draw.moveTo(event.start.x, event.start.y);
                this._draw.lineTo(event.end.x, event.end.y);
                this._draw.moveTo(event.end.x - headLength * Math.cos(angle - Math.PI / 6), event.end.y - headLength * Math.sin(angle - Math.PI / 6));
                this._draw.lineTo(event.end.x, event.end.y);
                this._draw.lineTo(event.end.x - headLength * Math.cos(angle + Math.PI / 6), event.end.y - headLength * Math.sin(angle + Math.PI / 6));
                break;
            case 'box':
                this._draw.strokeRect(event.start.x, event.start.y, event.end.x - event.start.x, event.end.y - event.start.y);
                break;
            case "oval":
                const center = {x: (event.start.x + event.end.x) / 2, y: (event.start.y + event.end.y) / 2};
                const height = Math.abs(event.start.y - event.end.y);
                const width = Math.abs(event.start.x - event.end.x);
                this._draw.ellipse(center.x, center.y, width / 2, height / 2, 0, 0, Math.PI * 2);
                break;
        }
        this._draw.stroke();
        this._draw.translate(-0.5, -0.5);

        if (this._scheduledSave) {
            clearTimeout(this._scheduledSave);
            this._scheduledSave = null;
        }
        this._scheduledSave = setTimeout(() => {
            this._image.annotationData = this._canvas.toDataURL();
            updateImageWithAnnotations(JOB_ID, this._image);
        }, 1000); //Save after a second of inactivity
    }

    getPoint(e) {
        this.updateSize();
        let pos = {x: e.pageX, y: e.pageY};
        if (e instanceof TouchEvent) {
            pos = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY}
        }
        return {
            x: (pos.x - this._renderResolution.left) * (this._nativeResolution.width / this._renderResolution.width),
            y: (pos.y - this._renderResolution.top) * (this._nativeResolution.height / this._renderResolution.height)
        }
    }

    updateSize() {
        this._renderResolution = this._canvas.getBoundingClientRect();
    }

    addButtons(headerElement) {
        const buttonContainer = $(`<div class="btn-group btn-group-toggle" data-toggle="buttons"></div>`).appendTo(headerElement);
        const controlContainer = $(`<div class="float-right"></div>`).appendTo(headerElement);

        $(`<label class="btn btn-outline-secondary active" data-toggle="tooltip" data-placement="top" title="Line"><input type="radio" name="canvas-tool" autocomplete="off"><i class="bi bi-pencil"></i></label>`).appendTo(buttonContainer).click(() => {
            this._currentTool = {
                type: 'line',
                thickness: this._currentTool.thickness,
            };
        }).click();

        $(`<label class="btn btn-outline-secondary" data-toggle="tooltip" data-placement="top" title="Box"><input type="radio" name="canvas-tool" autocomplete="off"><i class="bi bi-bounding-box"></i></label>`).appendTo(buttonContainer).click(() => {
            this._currentTool = {
                type: 'box',
                thickness: this._currentTool.thickness,
            };
        });

        $(`<label class="btn btn-outline-secondary" data-toggle="tooltip" data-placement="top" title="Arrow"><input type="radio" name="canvas-tool" autocomplete="off"><i class="bi bi-arrow-right"></i></label>`).appendTo(buttonContainer).click(() => this._currentTool = {
            type: 'arrow',
            thickness: this._currentTool.thickness,
        });

        $(`<label class="btn btn-outline-secondary" data-toggle="tooltip" data-placement="top" title="Oval"><input type="radio" name="canvas-tool" autocomplete="off"><i class="bi bi-circle"></i></label>`).appendTo(buttonContainer).click(() => this._currentTool = {
            type: 'oval',
            thickness: this._currentTool.thickness,
        });

        $(`<label class="btn btn-outline-secondary" data-toggle="tooltip" data-placement="top" title="Eraser"><input type="radio" name="canvas-tool" autocomplete="off"><i class="bi bi-eraser"></i></label>`).appendTo(buttonContainer).click(() => this._currentTool = {
            type: 'eraser',
            thickness: this._currentTool.thickness,
        });

        buttonContainer.children().tooltip();

        //Thickness slider
        $(`<label class="d-flex mb-0"><span>Thickness</span><input type="range" class="form-control-range ml-1" min="1" max="50" value="${this._currentTool.thickness}"></label>`).appendTo(controlContainer).on("input change", (e) => {
            this._currentTool.thickness = e.target.value;
        });
        $(`<label class="d-flex mb-0"><span>Color</span><span class="input-group-text colorpicker-input-addon circle-colour-picker ml-1"><i></i></span></label>`).appendTo(controlContainer).on("colorpickerChange", (e) => {
            this._currentTool.color = e.color.toString();
        }).colorpicker({
            color: this._currentTool.color,
            useAlpha: false
        });
    }
}