import { html, render } from 'lit-html';
import cantons from '../../data/pictureParamByCanton.csv';
import { getAllRiskAssessmentsWithFlag } from '../utils/api';
import { b64encode } from '../utils/utilities';

class OverviewComponent {
    constructor(containerRA, containerPagination, language = 'de') {
        // class data
        this.containerRA = containerRA;
        this.containerPagination = containerPagination;
        this.language = language;
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
        getAllRiskAssessmentsWithFlag(this.limit, this.offset).then((response) => {
            this.riskassessments = response.items;

            this.pages = Math.ceil(response.count / this.limit);

            this.riskassessments = this.riskassessments.map((eq) => {
                if (this.pdf === 'yes') {
                    let url = `${process.env.SERVER}/reia.html?oid=${eq._oid}`;
                    eq.ch_url = `${this.pdfUrl}${b64encode(`${url}&lng=${this.lang}`)}`;
                    eq.kt_urls = Object.entries(this.cantons).map(
                        (c) =>
                            `${this.pdfUrl}${b64encode(`${url}&canton=${c[0]}&lng=${this.lang}`)}`
                    );
                } else {
                    eq.ch_url = `/reia.html?oid=${eq._oid}`;
                    eq.kt_urls = Object.entries(this.cantons).map(
                        (c) => `${eq.ch_url}&canton=${c[0]}`
                    );
                }
                return eq;
            });
            this.update();
        });
    }

    template = () =>
        html` ${this.riskassessments
            ? this.riskassessments.map(
                  (e) => html`
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
                                        <a href="${e.ch_url}" target="_blank"> CH </a>
                                    </td>
                                    <td>
                                        ${Object.entries(this.cantons).map(
                                            (c, idx) => html`
                                                <a href="${e.kt_urls[idx]}" target="_blank">
                                                    ${c[0]}
                                                </a>
                                            `
                                        )}
                                    </td>`
                              : html`<td>
                                        <a href="${e.ch_url}" target="_blank"> CH </a>
                                    </td>
                                    <td>
                                        ${Object.entries(this.cantons).map(
                                            (c, idx) => html`
                                                <a href="${e.kt_urls[idx]}" target="_blank">
                                                    ${c[0]}
                                                </a>
                                            `
                                        )}
                                    </td>`}
                      </tr>
                  `
              )
            : html``}`;

    pagination = () =>
        html` <nav aria-label="Page navigation example">
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
                    <a class="page-link" href="#" @click=${() => this.changeParam('page', 1)}>1</a>
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
        </nav>`;

    changeParam(param, value) {
        this.params.set(param, value);
        window.location.search = this.params.toString();
    }

    update = () => {
        render(this.template(), this.containerRA);
        render(this.pagination(), this.containerPagination);
    };
}

export default OverviewComponent;
