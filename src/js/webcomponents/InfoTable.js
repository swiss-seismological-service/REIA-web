import { html, render } from 'lit-html';
import proj4 from 'proj4';
import i18next from 'i18next';

import { round, parseUTCDate, formatDate, formatTime, b64encode } from '../utils/utilities';

class InfoTable extends HTMLElement {
    constructor() {
        super();

        this.originid = null;
        this._originInfo = null;
        this.originPromise = null;

        proj4.defs(
            'EPSG:2056',
            '+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs'
        );
    }

    // component attributes
    static get observedAttributes() {
        return ['originid', 'origininfo'];
    }

    // attribute change
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;

        this[property] = newValue;
    }

    set origininfo(val) {
        if (typeof val === 'string' || val instanceof String) {
            val = JSON.parse(decodeURIComponent(val));
        }

        this._originInfo = val;
        this.parseOriginInfo();
        this.update();
    }

    get origininfo() {
        return this._originInfo;
    }

    // called once at the beginning
    connectedCallback() {
        this.update();
    }

    parseOriginInfo = () => {
        try {
            [this.origininfo.longitude, this.origininfo.latitude] = proj4('EPSG:2056', [
                this.origininfo.longitude,
                this.origininfo.latitude,
            ]);
            this.origininfo.longitude = round(this.origininfo.longitude, 0);
            this.origininfo.latitude = round(this.origininfo.latitude, 0);
        } catch (e) {} // eslint-disable-line

        this.origininfo.time = this.origininfo?.time ? parseUTCDate(this.origininfo.time) : null;
        this.origininfo.date = this.origininfo.time ? formatDate(this.origininfo.time) : null;
        this.origininfo.time = this.origininfo.time ? formatTime(this.origininfo.time) : null;

        this.origininfo.href = `http://seismo.ethz.ch/en/earthquakes/switzerland/eventpage.html?originId=%27${b64encode(
            this.originid
        )}%27`;
    };

    template = () =>
        html`<table class="table table-sm overview__table">
            <tbody>
                <tr>
                    <td>${i18next.t('report:ueberblick-zeit')}</td>
                    <td id="info-time">${this.origininfo?.time || '-'}</td>
                </tr>
                <tr>
                    <td>${i18next.t('report:ueberblick-datum')}</td>
                    <td id="info-date">${this.origininfo?.date || '-'}</td>
                </tr>
                <tr>
                    <td><span>${i18next.t('report:ueberblick-tiefe')}</span> [km]</td>
                    <td id="info-depth">${round(this.origininfo?.depth, 1) || '-'}</td>
                </tr>
                <tr>
                    <td>
                        <span>${i18next.t('report:mag')}</span>
                        <span id="info-magtype">[${this.origininfo?.magnitudetype || ''}]</span>
                    </td>
                    <td id="info-magnitude">${round(this.origininfo?.magnitude, 1) || '-'}</td>
                </tr>
                <tr>
                    <td>${i18next.t('report:ueberblick-auswertung')}</td>
                    <td id="info-auswertung">
                        ${this.origininfo?.evaluationmode || i18next.t('ueberblick-auswertung-val')}
                    </td>
                </tr>
                <tr>
                    <td>${i18next.t('report:ueberblick-koord')}</td>
                    <td id="info-koordinaten">
                        ${this.origininfo?.longitude || '-'} / ${this.origininfo?.latitude || '-'}
                    </td>
                </tr>
                <tr>
                    <td>${i18next.t('report:ueberblick-weiter')}</td>
                    <td>
                        <a id="info-meta" href="${this.origininfo?.href}" target="_blank">Link</a>
                    </td>
                </tr>
            </tbody>
        </table>`;

    update = () => {
        render(this.template(), this);
    };
}

customElements.define('info-table', InfoTable);
