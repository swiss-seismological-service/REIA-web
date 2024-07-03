import { html, render } from 'lit-html';
import { formatLocale } from 'd3-format';
import CantonalGraph from '../utils/CantonalGraph';
import styles from '../../sass/loss_graph.wc.scss';

class DamageGraph extends HTMLElement {
    constructor() {
        super();
        this._root = this.attachShadow({ mode: 'closed' });
        this.readyPromise = null;
    }

    // component attributes
    static get observedAttributes() {
        return ['data', 'language'];
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;

        this[property] = newValue;

        this.update();
    }

    // this.data setter
    set data(val) {
        if (typeof val === 'string' || val instanceof String) {
            val = JSON.parse(decodeURIComponent(val));
        }

        this._data = val;

        if (this._data) {
            this.updateGraph();
        }
    }

    // this.data getter
    get data() {
        return this._data;
    }

    // option to set this.data via method by passing a promise
    setData = (dataPromise) => {
        dataPromise.then((data) => {
            this.data = data;
        });
    };

    // called once at the beginning
    connectedCallback() {
        this.update();
        this.node = this._root.querySelector('div:first-of-type').firstChild;
    }

    updateGraph = () => {
        const graphNode = CantonalGraph(this.data, 2, {
            marginLeft: 30,
            marginRight: 20,
            gutter: 40,
            x: (d) => [d.damage_pc10, d.damage_mean, d.damage_pc90, d.damage_percentage],
            y: (d) => d.tag[0],
            symlogConstant: 5.5,
            xTickFormat: (d) =>
                d === 1
                    ? "≤ 5"
                    : formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
            xDomain: [1, 500000],
            xTickValues: [1, 50, 500, 5000, 50000],
            width: 600,
            height: 375,
            displayValue: true,
        });

        this.node.parentElement.replaceChild(graphNode, this.node);
        this.node = graphNode;
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

customElements.define('damage-graph', DamageGraph);
