

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

class EventEmitter {
    constructor() {
        this._events = {};
    }
    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener);
        return this;
    }
    emit(evt, arg) {
        console.log(evt);
        (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
    }
}

/**
 * The Model. Model stores items and notifies
 * observers about changes.
 */
class Model extends EventEmitter {
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


class InspectorView extends EventEmitter {
    constructor(model, elements) {
        super();
        this._model = model;
        this._elements = elements;

        model.on('vizComponentElementUpdated', vcl => this.updateVizComponentElement(vcl));
        
        this._elements.inspectorVizSegIdInput.addEventListener('keydown', evt => {
            evt.returnValue = /[a-zA-Z0-9_&\s\-]/gi.test(evt.key);
            return evt.srcElement.value;
        });
        this._elements.inspectorVizSegIdInput.addEventListener('keyup', evt =>
            this.emit('vizSegIdUpdated', evt.srcElement.value)
        );
        elements.inspectorVizSegIdInputClearControl.addEventListener('click', () =>
            this.emit('clickClearVizSegId')
        );
    }

    updateVizComponentElement(vcl) {
        if (this._elements.inspectorRenderContainer.childNodes[0]) {
            this._elements.inspectorRenderContainer.removeChild(this._elements.inspectorRenderContainer.childNodes[0]);
        }
        if (toString.call(vcl) === '[object Null]') {
            this._elements.inspectorVizElementTag.innerHTML = 'none';
        } else {
            const vizSegId = vcl.getAttribute('vizSegId') || '';
            this._elements.inspectorVizSegIdInput.value = vizSegId;
            this._elements.inspectorVizSegIdInput.focus();
            if (vizSegId === '') {
                this._elements.inspectorVizSegIdInputClearControl.style.visibility = 'hidden'
            } else {
                this._elements.inspectorVizSegIdInputClearControl.style.visibility = 'visible'
            }

            this._elements.inspectorVizElementTag.innerHTML = vcl.tagName;

            const bbRect = this._elements.inspectorRenderContainer.getBoundingClientRect();
            const bbWidth = bbRect.width - 15;
            const bbHeight = bbRect.height - 15;
            const bbAspectRatio = bbRect.width / bbRect.height;

            const inspSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            inspSvg.setAttribute('width', bbWidth);
            inspSvg.setAttribute('height', bbHeight);
            inspSvg.appendChild(vcl.cloneNode(true)); // Send a clone!
            this._elements.inspectorRenderContainer.appendChild(inspSvg);

            console.log(this._elements.inspectorRenderContainer);
        }
    }

}
//https://mark-rolich.github.io/Magnifier.js/
class InspectorController {
    constructor(model, view) {
        this._model = model;
        this._view = view;

        view.on('vizSegIdUpdated', newVal => this._model.setVizSegId(newVal));
        view.on('clickClearVizSegId', () => this._model.setVizSegId(null));
    }

}

/**
 * The View. View presents the model and provides
 * the UI events. The controller is attached to these
 * events to handle the user interaction.
 */
class PreviewView extends EventEmitter {
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
        console.log('firing');
        console.log(this._elements);
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

class SVG {
    constructor() {
        this._domParser = new DOMParser();
        this._isScaled = false;
        // this._viewBox = null;
        this._svg;
    }

    reset() {
        this._originalWidth = null;
        this._originalHeight = null;
        this._svg = null;
        return this;
    }

    load(xml) {
        this.reset();
        this._svg = this._domParser.parseFromString(xml, 'image/svg+xml').documentElement;
        return this;
    }

    scale(boundingBox) {

        //SET viewBox


        // Bounding Box
        const bbWidth = boundingBox.width - 10;
        const bbHeight = boundingBox.height - 10;
        const bbAspectRatio = boundingBox.width / boundingBox.height;

        // Dimensions for display
        let vbWidth, vbHeight, vbAspectRatio;

        // Get viewBox from SVG ("min-x min-y width height")
        const svgViewBox = this._svg.getAttribute('viewBox');
        const hasViewBox = svgViewBox ? true : false;

        // Test for height & width attributes
        if (svgViewBox) {
            vbWidth = Number(svgViewBox.split(' ')[2]);
            vbHeight = Number(svgViewBox.split(' ')[3]);
            if (!vbWidth) {
                throw `SVG has a viewBox with but is missing a width value: "${svgViewBox}"`;
            }
            if (!vbHeight) {
                throw `SVG has a viewBox with but is missing a height value: "${svgViewBox}"`;
            }
            vbAspectRatio = vbWidth / vbHeight;
        }

        // Set width & height attributes of svg
        if (this._svg.width.baseVal.valueAsString === '100%') { // 1=>px
            if (!vbWidth) {
                throw `SVG has no width value or viewBox - unable to render.`;
            }
            if (bbAspectRatio >= 1) {   // bb is wide
                if (vbAspectRatio >= 1) {   // bb & vb are wide => bb width is the limiter
                    this._svg.setAttribute('width', bbWidth);
                    this._svg.setAttribute('height', Math.round(bbWidth / bbAspectRatio));
                } else {    // bb is wide & vb is tall => bb height is the limiter
                    this._svg.setAttribute('width', Math.round(bbHeight * bbAspectRatio));
                    this._svg.setAttribute('height', bbHeight);
                }
            } else {    // bb is tall
                if (vbAspectRatio >= 1) {   // bb is tall & vb is wide => bb width is the limiter
                    this._svg.setAttribute('width', bbWidth);
                    this._svg.setAttribute('height', Math.round(bbWidth / bbAspectRatio));
                } else {    // bb is tall & vb is tall => bb height is the limiter
                    this._svg.setAttribute('width', Math.round(bbHeight * bbAspectRatio));
                    this._svg.setAttribute('height', bbHeight);
                }
            }
            this._isScaled = true;
        }
        return this;
    }

    getSvg() {
        return this._svg;
    }

    export() {
        const svg = this._svg.cloneNode(true);
        if (this._isScaled) {
            svg.removeAttribute('width');
            svg.removeAttribute('height');
        }
        return svg.outerHTML;
    }
}

/**
 * The Controller. Controller responds to user actions and
 * invokes changes on the model.
 */
class PreviewController {
    constructor(model, view) {
        this._model = model;
        this._view = view;

        this._domParser = new DOMParser();
        this._fileReader = new FileReader();
        this._fileReader.addEventListener('load', evt => this.processSvgXml(evt.target.result));

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
        this._model.startOver();
    }

    updateFileName(fileName) {
        this._model.setFileName(fileName);
    }

    processSvgXml(xml) {
        const previewSVG = (new SVG()).load(xml).scale(this._view.getBoundingClientRect());

        // Add Event Listeners
        ['circle', 'polyline', 'polygon', 'path', 'line', 'ellipse', 'rect'].forEach(componentType => {
            Array.from(previewSVG.getSvg().getElementsByTagName(componentType)).forEach(component =>
                component.addEventListener('click', evt => this.receiveSvgClick(evt))
            );
        });

        this._model.setPreviewSVG(previewSVG);
    }

    receiveSvgClick(evt) {
        this._model.setVizComponentElement(evt.target);
    }

    downloadFile() {
        console.log(this._model._previewSVG.export());
    }

  }


//   https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server