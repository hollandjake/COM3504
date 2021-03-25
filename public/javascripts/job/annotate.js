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
        const [container, draw, imageNode, size] = await this.createCanvas(this._image, this._imageClasses, this._containerClasses);
        this._container = container;
        this._draw = draw;
        this._size = size;
        this._containerNode = draw.symbol().size(size.width, size.height);
        this._is_drawing = false;
        this._my_active_drawing = null;
        this._offset = { x: window.pageXOffset, y: window.pageYOffset };
        this.m = this._draw.node.getScreenCTM().inverse();

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
        let imageNode = draw.image(image.imageUrl);

        annotationContainer.append(draw.node);

        return [annotationContainer, draw, imageNode, {width: width, height: height}];
    }

    initEvents() {
        const annotation = this;
        let node = this._draw.node;
        try {
            node.addEventListener('onmousedown', (e) => annotation.startDrawing(e));
            node.ontouchstart((e) => annotation.startDrawing(e));
            node.onmouseup((e) => annotation.endDrawing(e));
            node.ontouchend((e) => annotation.endDrawing(e));
            node.onmouseout((e) => annotation.endDrawing(e));
            node.ontouchcancel((e) => annotation.endDrawing(e));
            node.onmousemove((e) => annotation.onDrag(e));
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
        return {
            x: e.clientX,
            y: e.clientY
        }
    }
}