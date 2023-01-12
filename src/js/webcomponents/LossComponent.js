import { html, render } from 'lit-html';
import i18next from 'i18next';
import styles from '../../sass/loss_component.wc.scss';
import { ColorScale, ColorScaleMarker, getPercentage } from '../utils/ColorScale';
import injectSVG from '../utils/injectSvg';
import { numberToString } from '../utils/numbers';

class LossComponent extends HTMLElement {
    constructor() {
        super();

        this.mean = null;
        this.q10 = null;
        this.q90 = null;
        this.type = null;
        this.thresholds = [0, 0, 0, 0, 0, 0];

        this.attachShadow({ mode: 'open' });

        this.update();

        this.colorscale = this.shadowRoot.getElementById('colorscale');
        this.colorScaleContext = ColorScale(this.colorscale);
        this.markerscale = this.shadowRoot.getElementById('markerscale');
    }

    // component attributes
    static get observedAttributes() {
        return ['mean', 'q10', 'q90', 'thresholds', 'type'];
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (property === 'thresholds') newValue = newValue.split(',').map((n) => parseFloat(n));

        this[property] = newValue;

        if (property === 'type' && newValue != null) this.setSVGs();

        if (property === 'mean' && !Number.isNaN(newValue)) this.showScale();

        this.selectIcon();

        if (this.mean != null && this.q10 != null && this.q90 != null) this.calculateLevel();

        this.update();
    }

    showScale = () => {
        this.shadowRoot.getElementById(`spinner${this.type}`).style.display = 'none';
        this.shadowRoot.getElementById(`lossdisplay${this.type}`).style.display = 'block';
    };

    setSVGs = () => {
        for (let i = 1; i <= 5; i++) {
            injectSVG(
                `images/icons/${this.type}_${i}.svg`,
                this.shadowRoot.getElementById(`loss-${i}`)
            );
        }
    };

    // called once at the beginning
    connectedCallback() {}

    selectIcon = (lossID) => {
        const isTrue =
            (this.thresholds[lossID - 1] <= this.mean &&
                (this.thresholds[lossID] || this.mean + 1) > this.mean) ||
            (lossID === this.thresholds.length - 1 &&
                this.mean >= this.thresholds[this.thresholds.length - 1]);

        return isTrue ? `active-${this.type}` : '';
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

        rootStyleSelector.setProperty(`--activeColor${this.type}`, `${color}`);
    };

    template = () => html` <style>
            ${styles}
        </style>
        <div class="loss">
            <slot name="titleslot"></slot>
            <div id="spinner${this.type}" class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div id="lossdisplay${this.type}" class="loss__display">
                <div class="loss__icons-box">
                    <div class="loss__icons ${this.selectIcon(1)}" id="loss-1"></div>
                    <div class="loss__icons ${this.selectIcon(2)}" id="loss-2"></div>
                    <div class="loss__icons ${this.selectIcon(3)}" id="loss-3"></div>
                    <div class="loss__icons ${this.selectIcon(4)}" id="loss-4"></div>
                    <div class="loss__icons ${this.selectIcon(5)}" id="loss-5"></div>
                </div>
                <div class="loss__icons-description">
                    <div class="loss__legend">${i18next.t('report:keine')}</div>
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

customElements.define('loss-component', LossComponent);
