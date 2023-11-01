import { html, render } from 'lit-html';
import styles from '../../sass/overview_component.wc.scss';
import cantons from '../../data/pictureParamByCanton.csv';
import { getAllRiskAssessments } from '../utils/api';
import { b64encode } from '../utils/b64';

class RiskAssessmentsComponent extends HTMLElement {
    constructor() {
        super();
        const params = new URLSearchParams(window.location.search);
        this.pdf = params.get('pdf') || 'yes';
        this.attachShadow({ mode: 'open' });
        this.lang = null;
        this.riskassessments = null;
        this.page = parseInt(params.get('page'), 10) || 1;
        this.pages = 1;
        this.limit = 20;
        this.offset = (this.page - 1) * this.limit;
        this.pdfUrl = 'http://erma.ethz.ch/pdf/?ready_status=ready_to_print&url=';

        this.cantons = Object.fromEntries(cantons);
        this.status = [
            'undefined',
            'failed',
            'aborted',
            'created',
            'submitted',
            'executing',
            'complete',
        ];
    }

    static get observedAttributes() {
        return ['lang'];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[property] = newValue;
        this.renderRiskAssessments();
    }

    // called once at the beginning
    connectedCallback() {
        this.update();
        this.renderRiskAssessments();
    }

    renderRiskAssessments() {
        getAllRiskAssessments(this.limit, this.offset).then((response) => {
            this.riskassessments = response.items;

            this.pages = Math.ceil(response.count / this.limit);

            this.riskassessments = this.riskassessments.map((eq) => {
                if (this.pdf === 'yes') {
                    eq.url = `http://erma.ethz.ch/reia.html?oid=${eq._oid}&lng=${this.lang}`;
                } else {
                    eq.url = `/reia.html?oid=${eq._oid}`;
                }
                return eq;
            });
            this.update();
        });
    }

    template = () => html`
        <style>
            ${styles}
        </style>
        <div class="container-xl">
            <slot name="headerslot"></slot>
        </div>
        <div class="container-xl">
            <div class="row">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Origin ID</th>
                            <th scope="col">Status (loss/dmg)</th>
                            <th scope="col">Creationtime</th>
                            <th scope="col">Country</th>
                            <th scope="col" data-i18n-key="report:overview-cantonal">
                                Cantonal Sheet
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.riskassessments
                            ? this.riskassessments.map(
                                  (e) =>
                                      html`
                                          <tr>
                                              <th scope="row">${e._oid}</th>
                                              <td>${e.originid}</td>
                                              <td>
                                                  ${`${this.status[e.losscalculation?.status]} / ${
                                                      this.status[e.damagecalculation?.status]
                                                  }`}
                                              </td>
                                              <td>${e.creationinfo.creationtime}</td>
                                              ${this.pdf === 'yes'
                                                  ? html`<td>
                                                            <a
                                                                href="${this.pdfUrl}${b64encode(
                                                                    e.url
                                                                )}"
                                                                target="_blank"
                                                            >
                                                                CH
                                                            </a>
                                                        </td>
                                                        <td>
                                                            ${Object.entries(this.cantons).map(
                                                                (c) => html`
                                                                    <a
                                                                        href="${this
                                                                            .pdfUrl}${b64encode(
                                                                            `${e.url}&canton=${c[0]}`
                                                                        )}"
                                                                        target="_blank"
                                                                    >
                                                                        ${c[0]}
                                                                    </a>
                                                                `
                                                            )}
                                                        </td>`
                                                  : html`<td>
                                                            <a href="${e.url}" target="_blank">
                                                                CH
                                                            </a>
                                                        </td>
                                                        <td>
                                                            ${Object.entries(this.cantons).map(
                                                                (c, idx) => html`
                                                                    ${(idx + 1) % 14 === 0
                                                                        ? html`<br />`
                                                                        : html``}
                                                                    <a
                                                                        href="${e.url}&canton=${c[0]}"
                                                                        target="_blank"
                                                                    >
                                                                        ${c[0]}
                                                                    </a>
                                                                `
                                                            )}
                                                        </td>`}
                                          </tr>
                                      `
                              )
                            : html``}
                    </tbody>
                </table>
                <nav aria-label="Page navigation example">
                    <ul class="pagination">
                        <li class="page-item">
                            <a
                                class="page-link"
                                href="#"
                                @click=${() => this.changeParam('page', this.page - 1)}
                                >Previous</a
                            >
                        </li>

                        <li class="page-item ${this.page === 1 ? 'active' : ''}">
                            <a
                                class="page-link"
                                href="#"
                                @click=${() => this.changeParam('page', 1)}
                                >1</a
                            >
                        </li>
                        <li class="page-item">
                            <a class="page-link disabled" href="#">...</a>
                        </li>

                        ${this.page !== 1 && this.page !== this.pages
                            ? html`
                                  <li class="page-item active" aria-current="page">
                                      <a class="page-link" href="#">${this.page}</a>
                                  </li>
                                  <li class="page-item">
                                      <a class="page-link disabled" href="#">...</a>
                                  </li>
                              `
                            : html``}

                        <li class="page-item ${this.page === this.pages ? 'active' : ''}">
                            <a
                                class="page-link"
                                href="#"
                                @click=${() => this.changeParam('page', this.pages)}
                                >${this.pages}</a
                            >
                        </li>

                        <li class="page-item">
                            <a
                                class="page-link"
                                href="#"
                                @click=${() => this.changeParam('page', this.page + 1)}
                                >Next</a
                            >
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    `;

    changeParam(param, value) {
        const params = new URLSearchParams(window.location.search);
        params.set(param, value);
        window.location.search = params.toString();
    }

    update = () => {
        render(this.template(), this.shadowRoot);
    };
}

customElements.define('risk-assessments-component', RiskAssessmentsComponent);
