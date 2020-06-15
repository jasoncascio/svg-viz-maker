/**
 * Preview View
 */
import _EventEmitter from './class._EventEmitter';
// const z = require('../../node_modules/svg-pan-zoom/dist/svg-pan-zoom.js');
// const svgPanZoome = z();
// const svgPanZoom = require('svg-pan-zoom');

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
        this._elements.previewRenderContainer.appendChild(svg.getSvg());
        // if (svg.svgIsSet()) {
        //     svgPanZoom(svg.getSvg(), {
        //         zoomEnabled: true,
        //         controlIconsEnabled: true,
        //         fit: true,
        //         center: true
        //     });
        // }
    }

    getBoundingClientRect() {
        return this._elements.previewRenderContainer.getBoundingClientRect();
    }

}