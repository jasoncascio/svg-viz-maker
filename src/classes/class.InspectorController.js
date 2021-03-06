/**
 * Inspector Controller
 */

export default class InspectorController {
    constructor(model, view) {
        // Data
        this._model = model;
        this._view = view;

        // Event Handlers
        view.on('vizSegIdInput', newVal => this._model.setVizSegId(newVal));
        view.on('clickClearVizSegId', () => this._model.setVizSegId(null));
    }
}