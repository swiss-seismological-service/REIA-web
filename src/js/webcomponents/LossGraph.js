import { html, render } from 'lit-html';
import { formatLocale } from 'd3-format';
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

    // update the graph
    updateGraph = () => {
        const graphNode = CantonalGraph(this.data, 1, {
            marginLeft: 30,
            marginRight: 20,
            widthDamage: 0,
            gutter: 60,
            x: (d) => [d.loss_pc10 < 1 ? 0 : d.loss_pc10,
                       d.loss_mean < 1 ? 0 : d.loss_mean,
                       d.loss_pc90 < 1 ? 0 : d.loss_pc90],
            y: (d) => d.tag,
            symlogConstant: 0.1,
            xTickFormat: (d) => d === 0.5 ? '0'
             : formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
            xDomain: [0.5, 50000],
            xTickValues: [0.5, 5, 50, 500, 5000],
            width: 600,
            height: 375,
            displayValue: false,
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

customElements.define('loss-graph', LossGraph);
