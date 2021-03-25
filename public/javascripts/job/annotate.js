import {loadImage} from "../components/preloadImage.js";

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
        const [container, draw, imageElement, imageSize] = await this.createCanvas(this._image, this._imageClasses, this._containerClasses);
        this._container = container;
        this._draw = draw;
        this._imageElement = imageElement;
        this._nativeResolution = imageSize;
        this._renderResolution = null;
        this._is_drawing = false;
        this._my_active_drawing = null;
        this._offset = { x: window.pageXOffset, y: window.pageYOffset };

        this.checkSize();
        this.initEvents();
        return this;
    }

    async createCanvas(image, imageClasses, containerClasses) {
        const imageObject = await loadImage(image.imageUrl, image.title, imageClasses);

        const annotationContainer = $(`<div class="annotation-container ${containerClasses}"></div>`);
        const annotationNode = annotationContainer.get()[0];

        let width = imageObject.width;
        let height = imageObject.height;
        let draw = SVG(annotationNode).viewbox(0, 0, width, height);
        let imageElement = draw.image(image.imageUrl);

        annotationContainer.append(draw.node);

        return [annotationContainer, draw, imageElement, {width: width, height: height}];
    }

    initEvents() {
        const annotation = this;
        let node = this._draw.node;
        try {
            node.addEventListener('mousedown', (e) => annotation.startDrawing(e));
            node.addEventListener('touchstart',(e) => annotation.startDrawing(e));
            node.addEventListener('mouseup',(e) => annotation.endDrawing(e));
            node.addEventListener('touchend',(e) => annotation.endDrawing(e));
            node.addEventListener('mousemove',(e) => annotation.onDrag(e));
            node.addEventListener('resize', (e) => annotation.updateSize());
        } catch (e) {
            console.log(e);
        }
    }

    startDrawing(e) {
        if (!this._is_drawing) {
            this._is_drawing = true;
            const point = this.getPoint(e);
            let initialPoint = [[point.x, point.y]];
            this._offset = { x: window.pageXOffset, y: window.pageYOffset };

            this._my_active_drawing = {
                id: 1,
                data: initialPoint,
                element: this._draw.polyline(initialPoint).fill('none').stroke({ width: 10 }),
                unprocessed_data: [],
            };
            this.onDraw(this._my_active_drawing);
            console.log('yee');
        }
    }

    endDrawing(e) {
        if (this._is_drawing) {
            this._is_drawing = false;
            console.log('booo')
        }
    }

    onDrag(e) {
        if (this._is_drawing) {
            const point = this.getPoint(e);
            this._my_active_drawing.unprocessed_data.push([point.x, point.y])
            this.onDraw(this._my_active_drawing);
        }
    }

    onDraw(delta) {
        delta.unprocessed_data.forEach(d => delta.data.push(d));
        delta.element.plot(delta.data);
        delta.unprocessed_data = [];
    }

    getPoint(e) {
        this.updateSize();
        return {
            x: e.offsetX * (this._nativeResolution.width / this._renderResolution.width),
            y: e.offsetY * (this._nativeResolution.height / this._renderResolution.height)
        }
    }

    updateSize() {
        let node = this._imageElement.node;
        this._renderResolution = node.getBoundingClientRect();
        console.log(this._renderResolution);
    }
}