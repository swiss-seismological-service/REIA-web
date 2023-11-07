import { html, render } from 'lit-html';
import { formatLocale } from 'd3-format';
import { getCantonalStructuralDamage } from '../utils/api';
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
        return ['damagecalculation', 'language'];
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[property] = newValue;

        if (property === 'damagecalculation') this.updateGraph();

        this.update();
    }

    // called once at the beginning
    connectedCallback() {
        this.update();
        this.node = this._root.querySelector('div:first-of-type').firstChild;
    }

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
        this.readyPromise = getCantonalStructuralDamage(this.damagecalculation).then(
            async (data) => {
                const graphNode = CantonalGraph(data, 2, {
                    marginLeft: 30,
                    marginRight: 20,
                    gutter: 40,
                    x: (d) => [d.damage_pc10, d.damage_mean, d.damage_pc90, d.damage_percentage],
                    y: (d) => d.tag[0],
                    symlogConstant: 5.5,
                    xTickFormat: (d) =>
                        d === 1
                            ? this.getZeroTick(this.language)
                            : formatLocale({ thousands: "'", grouping: [3] }).format(',.0f')(d),
                    xDomain: [1, 500000],
                    xTickValues: [1, 50, 500, 5000, 50000],
                    width: 600,
                    height: 375,
                    displayValue: true,
                });

                this.node.parentElement.replaceChild(graphNode, this.node);
                this.node = graphNode;
            }
        );
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
