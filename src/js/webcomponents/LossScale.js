import { html, render } from 'lit-html';
import styles from '../../sass/loss_scale.wc.scss';
import { ColorScale, ColorScaleMarker, getPercentage } from '../utils/ColorScale';
import { numberToString, injectSVG, importFolder } from '../utils/utilities';

const lossIcons = importFolder(require.context('../../images/icons/loss_scale', false, /\.svg$/));

class LossScale extends HTMLElement {
    constructor() {
        super();

        this._root = this.attachShadow({ mode: 'closed' });
        this.data = null;

        this.update();
    }

    // component attributes
    static get observedAttributes() {
        return ['data', 'losscategory', 'language'];
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;

        this[property] = newValue;

        if (newValue && property === 'losscategory') {
            this.setThresholds();
        }
    }

    // this.data setter
    set data(val) {
        if (typeof val === 'string' || val instanceof String) {
            [val] = JSON.parse(decodeURIComponent(val));
        }

        this._data = val;

        if (this._data) {
            this.update();
            this.calculateLevel();
            this.injectSVGs();
            this.update();
        }
    }

    // this.data getter
    get data() {
        return this._data;
    }

    // option to set this.data via method by passing a promise
    setData = (dataPromise) => {
        dataPromise.then((data) => {
            [this.data] = data;
        });
    };

    // get the text for the first tick in the correct language
    getZeroTick = (lng) => {
        const tick = {
            de: 'keine',
            fr: 'aucune',
            it: 'nessuno',
            en: 'none',
        };
        return tick[lng];
    };

    // set the thresholds for the color scale and labels
    setThresholds = () => {
        const thresh = {
            fatalities: [0, 5, 50, 500, 5000, 50000],
            displaced: [0, 50, 500, 5000, 50000, 500000],
            structural: [0, 10000000, 100000000, 1000000000, 10000000000, 100000000000],
        };
        this.thresholds = thresh[this.losscategory];
    };

    // select the correct svg's for the loss category
    injectSVGs = () => {
        for (let i = 1; i <= 5; i++) {
            injectSVG(
                lossIcons[`${this.losscategory}_${i}.svg`],
                this._root.getElementById(`loss-${i}`)
            );
        }
    };

    // called once at the beginning
    connectedCallback = () => {};

    // check whether a loss icon should be active
    setHighlightedIcon = (lossID) => {
        if (!this.thresholds || !this.losscategory) return '';
        const isTrue =
            (this.thresholds[lossID - 1] <= this.data.loss_mean &&
                (this.thresholds[lossID] || this.data.loss_mean + 1) > this.data.loss_mean) ||
            (lossID === this.thresholds.length - 1 &&
                this.data.loss_mean >= this.thresholds[this.thresholds.length - 1]);

        return isTrue ? `active-${this.losscategory}` : '';
    };

    // calculate color scale marker position
    calculateLevel = () => {
        this.markerscale = this._root.getElementById('markerscale');
        this.colorscale = this._root.getElementById('colorscale');
        this.colorScaleContext = ColorScale(this.colorscale);

        let [meanPct, p10Pct, p90Pct] = [
            this.data.loss_mean,
            this.data.loss_pc10,
            this.data.loss_pc90,
        ].map((v) => getPercentage(v, this.thresholds));

        let rootStyleSelector = document.querySelector(':root').style;

        ColorScaleMarker(p10Pct, meanPct, p90Pct, this.markerscale);

        let rgba = this.colorScaleContext.getImageData(
            this.colorscale.width * Math.min(meanPct, 0.99),
            0,
            1,
            1
        ).data;

        let color = `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`;

        rootStyleSelector.setProperty(`--activeColor${this.losscategory}`, `${color}`);
    };

    template = () =>
        html` <style>
                ${styles}
            </style>
            <div class="loss">
                <slot name="titleslot"></slot>
                <slot name="paragraphslot"></slot>
                ${!this.data || !this.losscategory || !this.language
                    ? html`<div class="spinner lds-ring">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                      </div>`
                    : html` <div class="loss__display">
                          <div class="loss__icons-box">
                              <div
                                  class="loss__icons ${this.setHighlightedIcon(1)}"
                                  id="loss-1"
                              ></div>
                              <div
                                  class="loss__icons ${this.setHighlightedIcon(2)}"
                                  id="loss-2"
                              ></div>
                              <div
                                  class="loss__icons ${this.setHighlightedIcon(3)}"
                                  id="loss-3"
                              ></div>
                              <div
                                  class="loss__icons ${this.setHighlightedIcon(4)}"
                                  id="loss-4"
                              ></div>
                              <div
                                  class="loss__icons ${this.setHighlightedIcon(5)}"
                                  id="loss-5"
                              ></div>
                          </div>
                          <div class="loss__icons-description">
                              <div class="loss__legend">${this.getZeroTick(this.language)}</div>
                              ${this.thresholds
                                  .slice(1, 5)
                                  .map(
                                      (step) =>
                                          html`<div class="loss__legend">
                                              ${numberToString(step)}
                                          </div>`
                                  )}
                              <div class="loss__legend"></div>
                          </div>
                          <div class="loss__colorscale">
                              <canvas id="colorscale"></canvas>
                              <canvas id="markerscale"></canvas>
                          </div>
                      </div>`}
            </div>`;

    update = () => {
        render(this.template(), this._root);
    };
}

customElements.define('loss-scale', LossScale);
