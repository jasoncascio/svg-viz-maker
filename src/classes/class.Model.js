/**
 * Main Model
 */
import _EventEmitter from './class._EventEmitter';
import SVG from './class.SVG';



export default class Model extends _EventEmitter {
    constructor() {
        super();
        this._fileName = null;
        this._previewSVG = new SVG();
        this._vizComponentElement = null;
    }

    startOver() {
        this.setFileName('None selected')
            .resetSvg()
            .setVizComponentElement(null);
        return this;
    }

    resetSvg() {
        this._previewSVG.reset();
        return this;
    }

    buildPreviewSvg(xml, boundingRect, callback) {
        this._previewSVG.load(xml).scale(boundingRect).setListeners(callback);
        this.emit('previewSvgUpdated', this._previewSVG);
        return this;
    }

    setFileName(fileName) {
        this._fileName = fileName;
        this.emit('fileNameUpdated', fileName);
        return this;
    }

    setVizComponentElement(vizComponentElement) {
        this._vizComponentElement = vizComponentElement;
        this.emit('vizComponentElementUpdated', this._vizComponentElement);
        return this;
    }

    setVizSegId(newVal) {
        if (toString.call(newVal) === '[object Null]' || newVal === '') {
            this._vizComponentElement.removeAttribute('vizSegId');
        } else {
            this._vizComponentElement.setAttribute('vizSegId', newVal);
        }
        this.emit('vizComponentElementUpdated', this._vizComponentElement);
    }

}