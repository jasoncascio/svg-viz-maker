/**
 * Main Model
 */
import _EventEmitter from './class._EventEmitter';
import SVG from './class.SVG';



export default class Model extends _EventEmitter {
    constructor() {
        super();
        this._fileName = null;
        this._previewSvg = new SVG();
        this._vizComponentSvg = new SVG();

        // this._selec
    }

    initialize() {
        this.setFileName('None selected');        
        this.emit('previewSvgUpdated', this._previewSvg.reset());
        this.emit('vizComponentElementUpdated', this._vizComponentSvg.reset());
        return this;
    }

    buildPreviewSvg(xml, boundingRect, callback) {
        this._previewSvg.load(xml).scale(boundingRect).setListeners(callback);
        this.emit('previewSvgUpdated', this._previewSvg);
        return this;
    }

    setFileName(fileName) {
        this._fileName = fileName;
        this.emit('fileNameUpdated', fileName);
        return this;
    }

    setVizComponentElement(vizComponentElement) {
        this._vizComponentSvg.load(vizComponentElement);
        this.emit('vizComponentElementUpdated', this._vizComponentSvg);
        return this;
    }

    setVizSegId(newVal) {
        this._vizComponentSvg.setAttribute('vizSegId', newVal);
    }

    getVizSegIds() {
        console.log(this._previewSvg.getAttributeValues('vizSegId'));
    }

    // getForwardToVizSegIds() { //forwardToVizSegId
    //     return this._previewSvg.getAttributeValues('vizSegId');
    // }

    getSvg() {
        return this._previewSvg.export();
    }

}