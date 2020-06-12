import _EventEmitter from './classes/class._EventEmitter';
import PreviewView from './classes/class.PreviewView';
import PreviewController from './classes/class.PreviewController';
import InspectorView from './classes/class.InspectorView';
import InspectorController from './classes/class.InspectorController';


function init(uiElements) {
    const model = new Model();
    const previewView = new PreviewView(model, uiElements);
    const previewController = new PreviewController(model, previewView);
    const inspectorView = new InspectorView(model, uiElements);
    const inspectorController = new InspectorController(model, inspectorView);

    return {
        model,
        previewView,
        previewController,
        inspectorView,
        inspectorController
    }
}


/**
 * The Model. Model stores items and notifies
 * observers about changes.
 */
class Model extends _EventEmitter {
    constructor() {
        super();
        this._fileName = null;
        this._previewSVG = null;
        this._vizComponentElement = null;
    }

    startOver() {
        this.setFileName('None selected')
            .setPreviewSVG(null)
            .setVizComponentElement(null);
        return this;
    }

    setPreviewSVG(svg) {
        this._previewSVG = svg;
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


//https://mark-rolich.github.io/Magnifier.js/

