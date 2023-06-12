import moment from 'moment';
import proj4 from 'proj4';
import i18next from 'i18next';
import { formatLocale } from 'd3';
import { round } from '../utils/numbers';
import { getDangerLevel, getOriginDescription, getOriginInfo } from '../utils/api';
import { b64encode } from '../utils/b64';

class RIAInfo {
    constructor(riskAssessment, sheetType) {
        this.infoTime = document.getElementById('info-time');
        this.infoDate = document.getElementById('info-date');
        this.infoDepth = document.getElementById('info-depth');
        this.infoIntensity = document.getElementById('info-intensity');
        this.infoAuswertung = document.getElementById('info-auswertung');
        this.infoSwiss = document.getElementById('info-swiss');
        this.infoMeta = document.getElementById('info-meta');

        this.overviewMagnitude = document.getElementById('overview-magnitude');
        this.overviewText = document.getElementById('overview-text');
        this.overviewWarnlevels = document.getElementsByClassName('overview__stufe__number');
        this.overviewPlaces = document.getElementsByClassName('overview-place');

        this.headerDatetime = document.getElementById('header-datetime');
        this.headerTitle = document.getElementById('header-title');
        this.headerWappen = document.getElementById('header-wappen');
        this.headerKuerzel = document.getElementById('header-kuerzel');

        this.footerLogo = document.getElementById('logo_bafu_babs');

        riskAssessment.then((info) => this.replaceInfoTable(info));
        riskAssessment.then((info) => this.replaceOverviewText(info, sheetType));
        riskAssessment.then((info) => this.replaceHeaderText(info, sheetType));

        proj4.defs(
            'EPSG:2056',
            '+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs'
        );
    }

    replaceInfoTable(info) {
        getOriginInfo(b64encode(info.originid)).then((originInfo) => {
            if ('longitude' in originInfo && 'latitude' in originInfo) {
                const [l, b] = proj4('EPSG:2056', [originInfo.longitude, originInfo.latitude]);
                let formatter = formatLocale({ thousands: "'", grouping: [3] }).format(',.0f');
                this.infoSwiss.innerHTML = `${formatter(l)} / ${formatter(b)}`;
            } else {
                this.infoSwiss.innerHTML = `- / -`;
            }

            let date = moment(originInfo.time);
            this.infoDate.innerHTML = date?.format('DD.MM.YYYY') || '-';
            this.infoTime.innerHTML = date?.format('HH:mm') || '-';

            this.infoDepth.innerHTML = round(originInfo.depth, 1) || '-';
            this.infoIntensity.innerHTML = round(originInfo.magnitude, 1) || '-';
            this.infoAuswertung.innerHTML =
                originInfo.evaluationmode || i18next.t('ueberblick-auswertung-val');

            this.infoMeta.href = `http://seismo.ethz.ch/en/earthquakes/switzerland/eventpage.html?originId=%27${b64encode(
                originInfo.originid
            )}%27`;

            this.overviewMagnitude.innerHTML = round(originInfo.magnitude, 1) || '-';

            let canton = originInfo.region.split(' ').pop();
            originInfo.region = `${originInfo.region.replace(canton, '')}(${canton})`;

            this.headerTitle.innerHTML = i18next.t('preposition_title', {
                name: originInfo.region || '-',
            });
        });
    }

    replaceOverviewText(info, sheetType) {
        getOriginDescription(b64encode(info.originid), i18next.resolvedLanguage).then(
            (description) => {
                this.overviewText.innerHTML = description.description || '';
            }
        );
        // this.overviewText.innerHTML = info[`description_${i18next.resolvedLanguage}`] || '';
        getDangerLevel(b64encode(info.originid)).then((warnlevel) => {
            warnlevel = warnlevel[0].alarmlevel;
            this.overviewWarnlevels[(warnlevel || 1) - 1].classList.add('active');
            this.overviewWarnlevels[(warnlevel || 1) - 1].innerHTML = warnlevel || '-';
        });
        let text =
            sheetType === 'CH'
                ? i18next.t('national-schweiz')
                : `${i18next.t('national-kanton')} ${sheetType}`;
        Array.from(this.overviewPlaces).forEach((el) => {
            el.innerHTML = text;
        });
    }

    replaceHeaderText(info, sheetType) {
        let date = moment(info.creationinfo.creationtime);
        this.headerDatetime.innerHTML = date.format('DD.MM.YYYY, HH:mm');

        this.headerKuerzel.innerHTML = sheetType;
        this.headerWappen.src = `images/wappen/${sheetType || 'CH'}.png`;
        this.footerLogo.src = `images/logos/logo_${i18next.resolvedLanguage}.svg`;
    }
}

export default RIAInfo;
