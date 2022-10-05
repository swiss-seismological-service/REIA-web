import { html, render } from 'lit-html';
import styles from '../../sass/mycounter.wc.scss';

class MyCounter extends HTMLElement {
    constructor() {
        super();
        this.count = 0;
        this.name = 'World';
        this.attachShadow({ mode: 'open' });
    }

    // component attributes
    static get observedAttributes() {
        return ['name'];
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[property] = newValue;
    }

    connectedCallback() {
        this.update();
    }

    inc = () => {
        this.count++;
        this.update();
    };

    dec = () => {
        this.count--;
        this.update();
    };

    template = () => html`
        <style>
            ${styles}
        </style>
        <h3>Hello ${this.name}!</h3>
        <button @click="${this.dec}">-</button>
        <span>${this.count}</span>
        <button @click="${this.inc}">+</button>
    `;

    update = () => {
        render(this.template(), this.shadowRoot, { host: this });
    };
}

customElements.define('my-counter', MyCounter);
