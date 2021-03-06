/**
 * Preview Controller
 */
import SVG from './class.SVG';



export default class PreviewController {
    constructor(model, view) {
        // Data
        this._model = model;
        this._view = view;

        // File Reader
        this._fileReader = new FileReader();
        this._fileReader.addEventListener('load', evt => this.processSvgXml(evt.target.result));

        // SVG Segment Click Handler
        this._handleSvgClick = evt => this._model.setVizComponentElement(evt.target);

        // Event Handlers
        view.on('clickStartOverButton', () => this.startOver());
        view.on('clickDownloadButton', () => this.downloadFile());
        view.on('fileSelected', file => {
            if (file.type !== 'image/svg+xml') { throw `${file.name} is not an svg file`; }
            this.startOver();
            this._fileReader.readAsText(file, 'UTF-8');
            this.updateFileName(file.name);
        });
    }

    startOver() {
        this._model.initialize();
    }

    updateFileName(fileName) {
        this._model.setFileName(fileName);
    }

    processSvgXml(xml) {
        this._model.buildPreviewSvg(xml, this._view.getBoundingClientRect(), this._handleSvgClick);
    }

    downloadFile() {
        console.log(this._model.getSvg());
    }
    /**
     * TODO:
     * Add download
     */
    // https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
  }


