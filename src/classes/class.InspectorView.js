import _EventEmitter from './class._EventEmitter';

export default class InspectorView extends _EventEmitter {
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