import {loadImage} from "../components/preloadImage.js";
import {annotations} from "./job.js";
const job = io.connect('/job');



$(function () {


    job.emit('join', JOB_ID);
    job.on('draw', function (annotationID, e) {
        //annotationID.startDrawing(e);
        console.log(annotations[0]);

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

    get eventNode() {
        return this._draw.node;
    }

    static generateUID() {
        // I generate the UID from two parts here
        // to ensure the random number provide enough bits.
        let firstPart = (Math.random() * 46656) | 0;
        let secondPart = (Math.random() * 46656) | 0;
        firstPart = ("000" + firstPart.toString(36)).slice(-3);
        secondPart = ("000" + secondPart.toString(36)).slice(-3);
        return firstPart + secondPart;
    }

    async init() {
        const [container, draw, imageElement, imageSize, imageID] = await this.createCanvas(this._image, this._imageClasses, this._containerClasses);
        this._container = container;
        this._draw = draw;
        this._imageElement = imageElement;
        this._nativeResolution = imageSize;
        //this._image_id = imageID;
        this._renderResolution = null;
        this._is_drawing = false;
        this._my_active_id = null;
        this._network_elements = {};
        this._tracker = 0;
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
        let imageID = image._id;

        annotationContainer.append(draw.node);

        return [annotationContainer, draw, imageElement, {width: width, height: height}, imageID];
    }

    initEvents() {
        const annotation = this;
        let node = this._draw.node;
        if (annotation._tracker == 0) {
            try {
                console.log("yeah");
                /*
                node.addEventListener('mousedown', (e) => annotation.startDrawing(e));
                node.addEventListener('mouseup', (e) => annotation.endDrawing(e));
                node.addEventListener('mouseleave', (e) => annotation.endDrawing(e));
                node.addEventListener('mousemove', (e) => annotation.onDrag(e));
                node.addEventListener('resize', (e) => annotation.updateSize());
                this.eventNode.addEventListener('startDrawing', (e) => annotation.onNetworkEvent(e));
                this.eventNode.addEventListener('endDrawing', (e) => annotation.onNetworkEvent(e));
                this.eventNode.addEventListener('onDraw', (e) => annotation.onNetworkEvent(e));
                 */
                node.addEventListener('mousedown', (e) => job.emit('draw', this._renderResolution, e, JOB_ID));
                node.addEventListener('mouseup', (e) => annotation.endDrawing(e));
                node.addEventListener('mouseleave', (e) => annotation.endDrawing(e));
                node.addEventListener('mousemove', (e) => annotation.onDrag(e));
                node.addEventListener('resize', (e) => annotation.updateSize());
                this.eventNode.addEventListener('startDrawing', (e) => annotation.onNetworkEvent(e));
                this.eventNode.addEventListener('endDrawing', (e) => annotation.onNetworkEvent(e));
                this.eventNode.addEventListener('onDraw', (e) => annotation.onNetworkEvent(e));

            } catch (e) {
                console.log(e);
            }
            annotation._tracker += 1;
        }
    }

    startDrawing(e) {
        if (!this._is_drawing) {
            this._is_drawing = true;
            const point = this.getPoint(e);
            let initialPoint = [[point.x, point.y]];
            this._my_active_id = Annotate.generateUID();

            this.eventNode.dispatchEvent(new CustomEvent('startDrawing', {
                detail: {
                    type: 'start',
                    id: this._my_active_id,
                    data: initialPoint,
                    color: "#FF0000"
                }
            }));
        }
    }

    startDrawing(e) {
        if (!this._is_drawing) {
            this._is_drawing = true;
            const point = this.getPoint(e);
            let initialPoint = [[point.x, point.y]];
            this._my_active_id = Annotate.generateUID();

            this.eventNode.dispatchEvent(new CustomEvent('startDrawing', {
                detail: {
                    type: 'start',
                    id: this._my_active_id,
                    data: initialPoint,
                    color: "#FF0000"
                }
            }));
        }
    }

    endDrawing(e) {
        if (this._is_drawing) {
            this._is_drawing = false;
            this.eventNode.dispatchEvent(new CustomEvent('endDrawing', {
                detail: {
                    type: 'end',
                    id: this._my_active_id
                }
            }));
        }
    }

    onDrag(e) {
        if (this._is_drawing) {
            const point = this.getPoint(e);
            let data = this._network_elements[this._my_active_id].data;
            data.push([point.x, point.y]);
            this.eventNode.dispatchEvent(new CustomEvent('onDraw', {
                detail: {
                    type: 'draw',
                    id: this._my_active_id,
                    data: data
                }
            }));
        }
    }

    onNetworkEvent(event) {
        const type = event.detail.type;

        if (type === 'end') {
            this._network_elements[event.detail.id] = null;
        } else if (type === 'start') {
            this._network_elements[event.detail.id] = {
                element: this._draw.polyline(event.detail.data).fill('none').stroke({
                    width: 10,
                    color: event.detail.color
                }),
                data: event.detail.data
            };
            this.onDraw(this._network_elements[event.detail.id]);
        } else if (type === 'draw') {
            this._network_elements[event.detail.id].data = event.detail.data;
            this.onDraw(this._network_elements[event.detail.id]);
        }
    }

    onDraw(lineData) {
        lineData.element.plot(lineData.data);
    }

    getPoint(e) {
        this.updateSize();
        return {
            x: (e.pageX - this._renderResolution.left) * (this._nativeResolution.width / this._renderResolution.width),
            y: (e.pageY - this._renderResolution.top) * (this._nativeResolution.height / this._renderResolution.height)
        }
    }

    updateSize() {
        let node = this._imageElement.node;
        this._renderResolution = node.getBoundingClientRect();
    }
}