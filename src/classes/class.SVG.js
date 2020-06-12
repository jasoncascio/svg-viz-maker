export default class SVG {
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