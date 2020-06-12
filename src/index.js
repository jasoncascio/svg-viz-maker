import './styles/main.scss';
import '../node_modules/@fortawesome/fontawesome-free/js/all.js'

import _EventEmitter from './classes/class._EventEmitter';
import PreviewView from './classes/class.PreviewView';
import PreviewController from './classes/class.PreviewController';
import InspectorView from './classes/class.InspectorView';
import InspectorController from './classes/class.InspectorController';
import Model from './classes/class.Model';

document.addEventListener("DOMContentLoaded", () => {

    const uiElements = [...document.querySelectorAll("[id^='c-']")].reduce((acc, el) => {
        acc[el.id.split('c-')[1]] = el;
        return acc;
    }, {});

    try {
        const model = new Model();
        const previewView = new PreviewView(model, uiElements);
        const previewController = new PreviewController(model, previewView);
        const inspectorView = new InspectorView(model, uiElements);
        const inspectorController = new InspectorController(model, inspectorView);
    } catch (e) {
        alert(e);
    }

});