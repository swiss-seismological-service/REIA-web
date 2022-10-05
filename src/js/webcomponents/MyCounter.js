import { html, render } from 'lit-html';

class MyCounter extends HTMLElement {
    constructor() {
        super();
        this.count = 0;
        this.attachShadow({ mode: 'open' });
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

    static style = () => `
      * {
        font-size: 200%;
      }

      span {
        width: 4rem;
        display: inline-block;
        text-align: center;
      }

      button {
        width: 64px;
        height: 64px;
        border: none;
        border-radius: 10px;
        background-color: seagreen;
        color: white;
      }
    `;

    template = () => html`
        <style>
            ${MyCounter.style()}
            @import style.css;
        </style>
        <button @click="${this.dec}">-</button>
        <span>${this.count}</span>
        <button @click="${this.inc}">+</button>
    `;

    update = () => {
        render(this.template(), this.shadowRoot, { host: this });
    };
}

customElements.define('my-counter', MyCounter);
