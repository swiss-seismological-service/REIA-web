import { html, render } from 'lit-html';
import cantons from '../../data/pictureParamByCanton.csv';
import { getAllRiskAssessments } from '../utils/api';
import { b64encode } from '../utils/utilities';

class OverviewComponent {
    constructor(container, language = 'de') {
        // class data
        this.container = container;
        this.lang = language;
        this.riskassessments = null;

        // Search Params
        this.params = new URLSearchParams(window.location.search);
        this.pdf = this.params.get('pdf') || 'yes';
        this.page = parseInt(this.params.get('page'), 10) || 1;

        // pagination
        this.pages = 1;
        this.limit = 20;
        this.offset = (this.page - 1) * this.limit;

        // constant data
        this.pdfUrl = `${process.env.PDF_GENERATOR}/?ready_status=ready_to_print&url=`;
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
        this.renderRiskAssessments();
    }

    set lang(val) {
        this._lang = val;
        this.update();
    }

    get lang() {
        return this._lang;
    }

    renderRiskAssessments() {
        getAllRiskAssessments(this.limit, this.offset).then((response) => {
            this.riskassessments = response.items;

            this.pages = Math.ceil(response.count / this.limit);

            this.riskassessments = this.riskassessments.map((eq) => {
                if (this.pdf === 'yes') {
                    eq.url = `${process.env.SERVER}/reia.html?oid=${eq._oid}`;
                } else {
                    eq.url = `/reia.html?oid=${eq._oid}`;
                }
                return eq;
            });
            this.update();
        });
    }

    template = () => html`<style>
            * {
                font-size: 1.2rem;
            }
        </style>
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
                                                                    `${e.url}&lng=${this.lang}`
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
                                                                            `${e.url}&canton=${c[0]}&lng=${this.lang}`
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
        </div> `;

    changeParam(param, value) {
        this.params.set(param, value);
        window.location.search = this.params.toString();
    }

    update = () => {
        render(this.template(), this.container);
    };
}

export default OverviewComponent;
