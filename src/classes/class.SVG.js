const svgPanZoom = require('svg-pan-zoom');


export default class SVG {
    constructor() {
        this._domParser = new DOMParser();
        this._isScaled = false;
        this._svg = null;
        this._origSvgNode = null;
        this._panZoom = null;

        this._setEmptySvg();
    }

    _setEmptySvg() {
        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this._origSvgNode = null;
        return this;
    }

    _appendChild(val) {
        this._svg.appendChild(val);
        return this;
    }

    _getNode(fromClone) {
        if (fromClone) {
            return this.svgIsSet() ? this._svg.childNodes[0] : this._svg;
        } else {
            return this._origSvgNode;
        }
    }

    getTagName(fromClone) {
        const node = this._getNode(fromClone);
        return node !== null ? node.tagName : 'none';
    }

    svgIsSet() {
        return this._svg.childNodes.length > 0;
    }

    reset() {
        this._originalWidth = null;
        this._originalHeight = null;
        this._svg.remove();
        this._setEmptySvg();
        return this;
    }

    getAttributeValues(attr, fromClone) {
        const node = this._getNode(fromClone);
        return [...node.querySelectorAll(`[${attr}]`)].reduce((acc, el) => {
            acc.push(el.getAttribute(attr));
            return acc;
        }, []);
    }

    setAttribute(attr, val, onClone) {
        const node = this._getNode(onClone);
        switch (toString.call(val)) {
            case '[object Undefined]':
            case '[object Null]':
                node.removeAttribute(attr);
                break;
            default:
                node.setAttribute(attr, val);
        }
        return this;
    }

    getAttribute(attr, fromClone) {
        const node = this._getNode(fromClone);
        return node !== null ? node.getAttribute(attr) : null;
    }

    _normalizeSegmentAttr(origSeg, clone, attr, def) {
        if (!clone.getAttribute(attr)) {
            let parent = origSeg.closest(`[${attr}]`) || origSeg.parentNode;
            if (parent.nodeName !== 'svg') {
                clone.setAttribute(attr, parent.getAttribute(attr) || def);
            }
        }
        return clone;
    }

    _normalizeSegment(origSeg, clone) {
        this._normalizeSegmentAttr(origSeg, clone, 'stroke', 'black');
        this._normalizeSegmentAttr(origSeg, clone, 'stroke-opacity', 1.0);
        this._normalizeSegmentAttr(origSeg, clone, 'stroke-width', 1.0);
        this._normalizeSegmentAttr(origSeg, clone, 'fill', 'black');
        this._normalizeSegmentAttr(origSeg, clone, 'fill-opacity', 1.0);
        return clone;
    }

    load(val, addPanZoom) {
        this.reset();

        switch(toString.call(val)) {
            case '[object String]':
                this._svg = this._domParser.parseFromString(val, 'image/svg+xml').documentElement;
                this._origSvgNode = this._svg;
                break;
            case '[object SVGSVGElement]':
                this._svg = val.cloneNode(true);
                this._origSvgNode = val;
                break;
            default:
                this._setEmptySvg()._appendChild(this._normalizeSegment(val, val.cloneNode(true)));
                this._origSvgNode = val;
        }

        if (addPanZoom) {
            if (this._panZoom) {
                this._panZoom.destroy();
            }
            this._panZoom = svgPanZoom(svg.getSvg(), {
                zoomEnabled: true,
                controlIconsEnabled: true,
                fit: true,
                center: true
            });
        }

        return this;
    }



    setListeners(callback) {
        ['circle', 'polyline', 'polygon', 'path', 'line', 'ellipse', 'rect', 'text'].forEach(componentType => {
            [...this._svg.getElementsByTagName(componentType)].forEach(component =>
                component.addEventListener('click', callback)
            );
        });
        return this;
    }

    scale(boundingBox) {

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
                //throw `SVG has no width value or viewBox - unable to render.`;
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

    _removeSvgPanZoomArtifacts(svg) { // use svgPanZoom destroy?
        svg.getElementById('svg-pan-zoom-controls').remove();
        svg.getElementById('svg-pan-zoom-controls-styles').remove();
        [...svg.getElementsByTagName('defs')].forEach(el => {
            if (el.childNodes.length === 0) {
                el.remove();
            }
        });
        return svg;
    }

    export() {
        const svg = this._removeSvgPanZoomArtifacts(this._svg.cloneNode(true));

        if (this._isScaled) {
            svg.removeAttribute('width');
            svg.removeAttribute('height');
        }
        return svg.outerHTML;
    }
}
