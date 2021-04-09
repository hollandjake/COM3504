import {loadImage} from "../components/preloadImage.js";

export default class Chatbox {
    constructor(image, imageClasses, containerClasses) {
        this._image = image;
        this._imageClasses = imageClasses;
        this._containerClasses = containerClasses;
    }

    get container() {
        return this._container;
    }

    async init() {
        const container = this.cont();
        this._container = container;
        return this;
    }

    cont() {
        let temp = $(`
            <div class="card-footer">
                <form>
                    <div class="input-group container pt-2">
                        <input name="chatmessage" type="text" class="form-control" placeholder="Type here">
                        <div class="input-group-append">
                            <div onclick="testF()" class="btn btn-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" ><path d="M0 0h24v24H0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/></svg>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `);

        return temp;
    }

    testF() {
        console.log("yes");

    }

}