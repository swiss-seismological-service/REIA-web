import { html, render } from 'lit-html';
import styles from '../../sass/loss_component.wc.scss';
import { ColorScale, ColorScaleMarker, getPercentage } from '../utils/ColorScale';
import { numberToString, injectSVG } from '../utils/utilities';
import { getLoss } from '../utils/api';

class LossScale extends HTMLElement {
    constructor() {
        super();
        this.mean = null;
        this.q10 = null;
        this.q90 = null;

        this.attachShadow({ mode: 'open' });

        this.readyPromise = null;

        this.colorscale = this.shadowRoot.getElementById('colorscale');
        this.colorScaleContext = ColorScale(this.colorscale);
        this.markerscale = this.shadowRoot.getElementById('markerscale');
    }

    // component attributes
    static get observedAttributes() {
        return ['losscalculation', 'lossCategory', 'language', 'aggregation'];
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;

        this[property] = newValue;

        if (property === 'losscalculation' && newValue != null) {
            this.updateData();
            this.update();
        }
    }

    updateData = () => {
        this.readyPromise = getLoss(
            this.losscalculation,
            this.lossCategory,
            'Canton',
            this.aggregation === 'CH' ? null : this.aggregation,
            this.aggregation === 'CH'
        ).then((data) => {
            [data] = data;
            this.mean = data.loss_mean;
            this.q10 = data.loss_pc10;
            this.q90 = data.loss_pc90;
            this.setThresholds();
            console.log(this.thresholds);
            this.setSvgType();
            this.setHighlightedIcon();
        });
    };

    // get the text for the first tick in the correct language
    getZeroTick = (lng) => {
        let tick = {
            de: 'keine',
            fr: 'aucune',
            it: 'nessuno',
            en: 'none',
        };
        return tick[lng];
    };

    setThresholds = () => {
        let thresh = {
            fatalities: [0, 5, 50, 500, 5000, 50000],
            displaced: [0, 50, 500, 5000, 50000, 500000],
            buildingcosts: [0, 10000000, 100000000, 1000000000, 10000000000, 100000000000],
        };

        this.thresholds = thresh[this.lossCategory];
    };

    showScale = () => {
        this.shadowRoot.getElementById(`spinner${this.lossCategory}`).style.display = 'none';
        this.shadowRoot.getElementById(`lossdisplay${this.lossCategory}`).style.display = 'block';
    };

    setSvgType = () => {
        for (let i = 1; i <= 5; i++) {
            injectSVG(
                `images/icons/${this.lossCategory}_${i}.svg`,
                this.shadowRoot.getElementById(`loss-${i}`)
            );
        }
    };

    // called once at the beginning
    connectedCallback() {}

    setHighlightedIcon = (lossID) => {
        if (!this.thresholds || !this.lossCategory) return '';
        const isTrue =
            (this.thresholds[lossID - 1] <= this.mean &&
                (this.thresholds[lossID] || this.mean + 1) > this.mean) ||
            (lossID === this.thresholds.length - 1 &&
                this.mean >= this.thresholds[this.thresholds.length - 1]);

        return isTrue ? `active-${this.lossCategory}` : '';
    };

    calculateLevel = () => {
        let [meanPc, q10Pc, q90Pc] = [this.mean, this.q10, this.q90].map((v) =>
            getPercentage(v, this.thresholds)
        );

        let rootStyleSelector = document.querySelector(':root').style;

        ColorScaleMarker(q10Pc, meanPc, q90Pc, this.markerscale);

        let rgba = this.colorScaleContext.getImageData(
            this.colorscale.width * Math.min(meanPc, 0.99),
            0,
            1,
            1
        ).data;

        let color = `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`;

        rootStyleSelector.setProperty(`--activeColor${this.lossCategory}`, `${color}`);
    };

    template = () => html` <style>
            ${styles}
        </style>
        <div class="loss">
            <slot name="titleslot"></slot>
            <slot name="paragraphslot"></slot>
            <div id="spinner${this.lossCategory}" class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div id="lossdisplay${this.lossCategory}" class="loss__display">
                <div class="loss__icons-box">
                    <div class="loss__icons ${this.setHighlightedIcon(1)}" id="loss-1"></div>
                    <div class="loss__icons ${this.setHighlightedIcon(2)}" id="loss-2"></div>
                    <div class="loss__icons ${this.setHighlightedIcon(3)}" id="loss-3"></div>
                    <div class="loss__icons ${this.setHighlightedIcon(4)}" id="loss-4"></div>
                    <div class="loss__icons ${this.setHighlightedIcon(5)}" id="loss-5"></div>
                </div>
                <div class="loss__icons-description">
                    <div class="loss__legend">${this.getZeroTick(this.language)}</div>
                    ${this.thresholds
                        .slice(1, 5)
                        .map(
                            (step) => html`<div class="loss__legend">${numberToString(step)}</div>`
                        )}
                    <div class="loss__legend"></div>
                </div>
                <div class="loss__colorscale">
                    <canvas id="colorscale"></canvas>
                    <canvas id="markerscale"></canvas>
                </div>
            </div>
        </div>`;

    update = () => {
        render(this.template(), this.shadowRoot);
    };
}

customElements.define('loss-scale', LossScale);
