import { html, render } from 'lit-html';
import { formatLocale } from 'd3-format';
import { getCantonalInjuries } from '../utils/api';
import CantonalGraph from '../utils/CantonalGraph';
import styles from '../../sass/loss_graph.wc.scss';

class LossGraph extends HTMLElement {
    constructor() {
        super();

        this._root = this.attachShadow({ mode: 'closed' });
        this.readyPromise = null;
    }

    // component attributes
    static get observedAttributes() {
        return ['losscalculation', 'language'];
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[property] = newValue;

        if (property === 'losscalculation') this.updateGraph();

        this.update();
    }

    // called once at the beginning
    connectedCallback() {
        this.update();
        this.node = this._root.querySelector('div:first-of-type').firstChild;
    }

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

    updateGraph = () => {
        this.readyPromise = getCantonalInjuries(this.losscalculation).then(async (data) => {
            const graphNode = CantonalGraph(data, 1, {
                marginLeft: 30,
                marginRight: 20,
                widthDamage: 0,
                gutter: 60,
                x: (d) => [d.loss_pc10, d.loss_mean, d.loss_pc90],
                y: (d) => d.tag,
                symlogConstant: 0.1,
                xTickFormat: (d) =>
                    d === 0.5
                        ? this.getZeroTick(this.language)
                        : formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
                xDomain: [0.5, 50000],
                xTickValues: [0.5, 5, 50, 500, 5000],
                width: 600,
                height: 375,
                displayValue: false,
            });

            this.node.parentElement.replaceChild(graphNode, this.node);
            this.node = graphNode;
        });
    };

    template = () => html`
        <style>
            ${styles}
        </style>
        <div><svg></svg></div>
    `;

    update = () => {
        render(this.template(), this._root);
    };
}

customElements.define('loss-graph', LossGraph);
