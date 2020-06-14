/**
 * Inspector View
 */
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
        this._elements.inspectorVizSegIdInput.addEventListener('keyup', evt => {
            this._setInspectorVizSegIdInput(evt.srcElement.value);
            this.emit('vizSegIdInput', evt.srcElement.value);
        });
        elements.inspectorVizSegIdInputClearControl.addEventListener('click', () => {
            this._setInspectorVizSegIdInput();
            this.emit('clickClearVizSegId')
        });
    }

    _setInspectorVizSegIdInputClearControlVisibility(bool) {
        this._elements.inspectorVizSegIdInputClearControl.style.visibility = bool ? 'visible' : 'hidden';
        return this;
    }

    _setInspectorVizSegIdInput(val) {
        const updVal = val || '';
        this._setInspectorVizSegIdInputClearControlVisibility(updVal !== '');
        this._elements.inspectorVizSegIdInput.value = updVal;
        return this;
    }

    _setInspectorVizElementTagName(val) {
        this._elements.inspectorVizElementTag.innerHTML = val;
        return this;
    }

    _enableInspectorVizSegIdInput(bool) {
        this._elements.inspectorVizSegIdInput.disabled = !(bool || false);
        return this;
    }

    updateVizComponentElement(vcl) {
        this._elements.inspectorRenderContainer.appendChild(vcl.getSvg());
        this._setInspectorVizElementTagName(vcl.getTagName());
        this._setInspectorVizSegIdInput(vcl.getAttribute('vizSegId'));
        this._enableInspectorVizSegIdInput(vcl.svgIsSet());
        this._elements.inspectorVizSegIdInput.focus();
    }
}