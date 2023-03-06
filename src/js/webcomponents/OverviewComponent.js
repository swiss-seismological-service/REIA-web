import { html, render } from 'lit-html';
import styles from '../../sass/overview_component.wc.scss';
import cantons from '../../data/pictureParamByCanton.csv';
// import { getAllEarthquakes } from '../utils/api';
import { b64encode } from '../utils/b64';

class OverviewComponent extends HTMLElement {
    // constructor() {
    //     super();
    //     const params = new URLSearchParams(window.location.search);
    //     this.pdf = params.get('pdf') || 'yes';
    //     this.attachShadow({ mode: 'open' });
    //     this.lang = null;
    //     this.earthquakes = null;
    //     this.pdfUrl = 'http://ermscenario.ethz.ch/pdf/?ready_status=ready_to_print&url=';
    //     this.cantons = Object.fromEntries(cantons);
    // }
    // static get observedAttributes() {
    //     return ['lang'];
    // }
    // attributeChangedCallback(property, oldValue, newValue) {
    //     if (oldValue === newValue) return;
    //     this[property] = newValue;
    //     this.renderEarthquakes();
    // }
    // // called once at the beginning
    // connectedCallback() {
    //     this.update();
    //     this.renderEarthquakes();
    // }
    // renderEarthquakes() {
    //     getAllEarthquakes().then((response) => {
    //         this.earthquakes = response;
    //         this.earthquakes = this.earthquakes.map((eq) => {
    //             if (this.pdf === 'yes') {
    //                 eq.url = `http://ermscenario.ethz.ch/?originid=${b64encode(eq.originid)}&lng=${
    //                     this.lang
    //                 }`;
    //             } else {
    //                 eq.url = `/?originid=${b64encode(eq.originid)}`;
    //             }
    //             return eq;
    //         });
    //         this.update();
    //     });
    // }
    // template = () => html`
    //     <style>
    //         ${styles}
    //     </style>
    //     <div class="container-xl">
    //         <slot name="headerslot"></slot>
    //     </div>
    //     <div class="container-xl">
    //         <div class="row">
    //             <table class="table">
    //                 <thead>
    //                     <tr>
    //                         <th scope="col">#</th>
    //                         <th scope="col"><h2>Origin ID</h2></th>
    //                         <th scope="col" data-i18n-key="report:overview-cantonal">
    //                             Cantonal Sheet
    //                         </th>
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     ${this.earthquakes
    //                         ? this.earthquakes.map(
    //                               (e, idx) =>
    //                                   html`
    //                                       <tr>
    //                                           <th scope="row">${idx + 1}</th>
    //                                           ${this.pdf === 'yes'
    //                                               ? html`<td>
    //                                                         <a
    //                                                             href="${this.pdfUrl}${b64encode(
    //                                                                 e.url
    //                                                             )}"
    //                                                             target="_blank"
    //                                                         >
    //                                                             ${e.event_text} ${e.magnitude_value}
    //                                                         </a>
    //                                                     </td>
    //                                                     <td>
    //                                                         ${Object.entries(this.cantons).map(
    //                                                             (c) => html`
    //                                                                 <a
    //                                                                     href="${this
    //                                                                         .pdfUrl}${b64encode(
    //                                                                         `${e.url}&canton=${c[0]}`
    //                                                                     )}"
    //                                                                     target="_blank"
    //                                                                 >
    //                                                                     ${c[0]}
    //                                                                 </a>
    //                                                             `
    //                                                         )}
    //                                                     </td>`
    //                                               : html`<td>
    //                                                         <a href="${e.url}" target="_blank">
    //                                                             ${e.event_text} ${e.magnitude_value}
    //                                                         </a>
    //                                                     </td>
    //                                                     <td>
    //                                                         ${Object.entries(this.cantons).map(
    //                                                             (c) => html`
    //                                                                 <a
    //                                                                     href="${e.url}&canton=${c[0]}"
    //                                                                     target="_blank"
    //                                                                 >
    //                                                                     ${c[0]}
    //                                                                 </a>
    //                                                             `
    //                                                         )}
    //                                                     </td>`}
    //                                       </tr>
    //                                   `
    //                           )
    //                         : html``}
    //                 </tbody>
    //             </table>
    //         </div>
    //     </div>
    // `;
    // update = () => {
    //     render(this.template(), this.shadowRoot);
    // };
}

customElements.define('overview-component', OverviewComponent);
