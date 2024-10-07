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

    // get the text for the first tick in the correct language and depending on loss category
    getZeroTick = (losscategory, lng) => {
        const tick = {
            fatalities: '0',
            displaced: `≤ 5`,
            structural: `≤ ${numberToString(1000000, lng)} CHF`,
        };
        return tick[losscategory];
    };

    // set the thresholds for the color scale and labels
    setThresholds = () => {
        const thresh = {
            fatalities: [0.5, 5, 50, 500, 5000, 50000],
            displaced: [5, 50, 500, 5000, 50000, 500000],
            structural: [1000000, 10000000, 100000000, 1000000000, 10000000000, 100000000000],
        };
        this.thresholds = thresh[this.losscategory];
    };

    injectSVGs = () => {
        for (let i = 1; i <= 5; i++) {
            injectSVG(
                lossIcons[`${this.losscategory}_${i}.svg`],
                this._root.querySelector(`#loss-${i}>svg`)
            );
        }
    };

    // called once at the beginning
    connectedCallback = () => {};

    // check whether a loss icon should be active
    setHighlightedIcon = (lossID) => {
        if (!this.thresholds || !this.losscategory) return '';
        const lossMean = Math.max(this.data.loss_mean, this.thresholds[0]);

        const isTrue =
            (this.thresholds[lossID - 1] <= lossMean &&
                (this.thresholds[lossID] || lossMean + 1) > lossMean) ||
            (lossID === this.thresholds.length - 1 &&
                lossMean >= this.thresholds[this.thresholds.length - 1]);

        return isTrue ? `active-${this.losscategory}` : '';
    };

    // calculate color scale marker position
    calculateLevel = () => {
        this.markerscale = this._root.getElementById('markerscale');
        this.colorscale = this._root.getElementById('colorscale');
        this.colorScaleContext = ColorScale(this.colorscale);

        // round up values smaller than 1, this way the scale will only
        // show some loss if the value is >= 1, even if the lowest threshold
        // is smaller than 1
        const minValue = Math.ceil(this.thresholds[0]);

        // compare each value with minValue, not threshold[0]
        // then get percentage for each value
        let [meanPct, p10Pct, p90Pct] = [
            this.data.loss_mean,
            this.data.loss_pc10,
            this.data.loss_pc90,
        ]
            .map((v) => (v < minValue ? this.thresholds[0] : v))
            .map((v) => getPercentage(v, this.thresholds));

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
                              <div class="loss__icons ${this.setHighlightedIcon(1)}" id="loss-1">
                                  <svg></svg>
                              </div>
                              <div class="loss__icons ${this.setHighlightedIcon(2)}" id="loss-2">
                                  <svg></svg>
                              </div>
                              <div class="loss__icons ${this.setHighlightedIcon(3)}" id="loss-3">
                                  <svg></svg>
                              </div>
                              <div class="loss__icons ${this.setHighlightedIcon(4)}" id="loss-4">
                                  <svg></svg>
                              </div>
                              <div class="loss__icons ${this.setHighlightedIcon(5)}" id="loss-5">
                                  <svg></svg>
                              </div>
                          </div>
                          <div class="loss__icons-description">
                              <div class="loss__legend">
                                  ${this.getZeroTick(this.losscategory, this.language)}
                              </div>
                              ${this.thresholds
                                  .slice(1, 5)
                                  .map(
                                      (step) =>
                                          html`<div class="loss__legend">
                                              ${numberToString(step, this.language)}
                                              ${this.losscategory === 'structural' ? 'CHF' : ''}
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
