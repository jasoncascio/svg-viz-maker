export default class SVG {
    constructor() {
        this._domParser = new DOMParser();
        this._isScaled = false;
        this._svg = null;
        this._origSvgNode = null;

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

    getTagName() {
        return this._origSvgNode !== null ? this._origSvgNode.tagName : 'none';
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

    getAttributeValues(attr) {
        const a = this._svg.querySelectorAll(`[${attr}]`);
        // const a = this._svg.querySelectorAll("[id^='c-']");
        console.log(a);
    }

    setAttribute(attr, val) {
        switch (toString.call(val)) {
            case '[object Undefined]':
            case '[object Null]':
                this._origSvgNode.removeAttribute(attr);
                break;
            default:
                this._origSvgNode.setAttribute(attr, val);
        }
        return this;
    }

    getAttribute(attr) {
        return this._origSvgNode !== null ? this._origSvgNode.getAttribute(attr) : null;
    }

    load(val) {
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
                this._setEmptySvg()._appendChild(val.cloneNode(true));
                this._origSvgNode = val;
        }

        return this;
    }

    setListeners(callback) {
        ['circle', 'polyline', 'polygon', 'path', 'line', 'ellipse', 'rect'].forEach(componentType => {
            [...this._svg.getElementsByTagName(componentType)].forEach(component =>
                component.addEventListener('click', callback)
            );
        });
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