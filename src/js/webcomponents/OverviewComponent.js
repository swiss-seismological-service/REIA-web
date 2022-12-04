import { html, render } from 'lit-html';
import cantons from '../../data/pictureParamByCanton.csv';
import { getAllEarthquakes } from '../utils/api';
import { b64encode } from '../utils/b64';

class OverviewComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.earthquakes = null;

        this.cantons = cantons.reduce((acc, curr) => {
            acc[curr[0]] = { params: curr[1] };
            return acc;
        }, {});

        this.injuredmap =
            'http://map.seddb20d.ethz.ch/cache2w/cgi-bin/mapserv?MAP=/var/www/mapfile/sed/erm_ch23_ria_pdf.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=shaded_relief_ch,rivers_white_ch,abroad_gray_ch,border_gray_ch_eu,lakes_white,injured_municipalities_ch,cities_ch&FORMAT=aggpng24';

        this.damagemap =
            'http://map.seddb20d.ethz.ch/cache2w/cgi-bin/mapserv?MAP=/var/www/mapfile/sed/erm_ch23_ria_pdf.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=shaded_relief_ch,rivers_white_ch,abroad_gray_ch,border_gray_ch_eu,lakes_white,damage_municipalities_ch,cities_ch&FORMAT=aggpng24';
    }

    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (property === 'thresholds') newValue = newValue.split(',').map((n) => parseFloat(n));
        this[property] = newValue;
    }

    // called once at the beginning
    connectedCallback() {
        this.update();
        this.renderEarthquakes();
    }

    renderEarthquakes() {
        getAllEarthquakes().then((response) => {
            this.earthquakes = response;
            this.update();
        });
    }

    template = () => html`
        <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT"
            crossorigin="anonymous"
        />
        <style>
            th,
            td {
                font-size: 12px;
            }
        </style>
        <div class="container-xl">
            <div class="row">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Origin ID</th>
                            <th scope="col">Cantonal Sheet</th>
                            <th scope="col">Injured Map</th>
                            <th scope="col">Damage Map</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.earthquakes
                            ? this.earthquakes.map(
                                  (e, idx) =>
                                      html`
                                          <tr>
                                              <th scope="row">${idx + 1}</th>
                                              <td>
                                                  <a
                                                      href="/?originid=${b64encode(e.originid)}"
                                                      target="_blank"
                                                  >
                                                      ${e.event_text} ${e.magnitude_value}
                                                  </a>
                                              </td>
                                              <td>
                                                  ${Object.entries(this.cantons).map(
                                                      (c) => html`
                                                          <a
                                                              href="/?originid=${b64encode(
                                                                  e.originid
                                                              )}&canton=${c[0]}"
                                                              target="_blank"
                                                          >
                                                              ${c[0]}
                                                          </a>
                                                      `
                                                  )}
                                              </td>
                                              <td>
                                                  ${Object.entries(this.cantons).map(
                                                      (c) => html`
                                                          <a
                                                              href="${this
                                                                  .injuredmap}&LOCID='${b64encode(
                                                                  e.originid
                                                              )}'&CANTON='${c[0]}'${c[1].params}"
                                                              target="_blank"
                                                          >
                                                              ${c[0]}
                                                          </a>
                                                      `
                                                  )}
                                              </td>
                                              <td>
                                                  ${Object.entries(this.cantons).map(
                                                      (c) => html`
                                                          <a
                                                              href="${this
                                                                  .damagemap}&LOCID='${b64encode(
                                                                  e.originid
                                                              )}'&CANTON='${c[0]}'${c[1].params}"
                                                              target="_blank"
                                                          >
                                                              ${c[0]}
                                                          </a>
                                                      `
                                                  )}
                                              </td>
                                          </tr>
                                      `
                              )
                            : html``}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    update = () => {
        render(this.template(), this.shadowRoot);
    };
}

customElements.define('overview-component', OverviewComponent);