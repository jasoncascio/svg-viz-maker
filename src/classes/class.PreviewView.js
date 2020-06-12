/**
 * Preview View
 */
import _EventEmitter from './class._EventEmitter';

/**
 * TODO
 *  1. magnifier? //https://mark-rolich.github.io/Magnifier.js/
 */

export default class PreviewView extends _EventEmitter {
    constructor(model, elements) {
        super();
        this._model = model;
        this._elements = elements;

        // attach model listeners
        model.on('fileNameUpdated', fileName => this.updateFileName(fileName))
             .on('previewSvgUpdated', svg => this.updateSvgElement(svg));
             
        // attach listeners to HTML controls
        elements.fileSelector.addEventListener('input', e =>
            this.emit('fileSelected', e.target.files[0])
        );
        elements.startOverButton.addEventListener('click', () => {
            this._elements.fileSelector.value = null;
            this.emit('clickStartOverButton')
        });
        elements.downloadButton.addEventListener('click', () =>
            this.emit('clickDownloadButton')
        );
    }

    updateFileName(fileName) {
        this._elements.fileName.innerHTML = fileName;
    }

    updateSvgElement(svg) {
        if (this._elements.previewRenderContainer.childNodes[0]) {
            this._elements.previewRenderContainer.removeChild(this._elements.previewRenderContainer.childNodes[0]);
        }
        if (toString.call(svg) !== '[object Null]') {
            this._elements.previewRenderContainer.appendChild(svg.getSvg());
        }
    }

    getBoundingClientRect() {
        return this._elements.previewRenderContainer.getBoundingClientRect();
    }

}