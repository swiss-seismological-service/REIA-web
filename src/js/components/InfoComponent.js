import moment from 'moment';
import proj4 from 'proj4';
import { round } from '../utils/numbers';

class RIAInfo {
    constructor(earthquakeInfo, sheetType) {
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

        this.headerDatetime = document.getElementById('header-datetime');
        this.headerTitle = document.getElementById('header-title');
        this.headerWappen = document.getElementById('header-wappen');
        this.headerKuerzel = document.getElementById('header-kuerzel');

        earthquakeInfo.then((info) => this.replaceInfoTable(info));
        earthquakeInfo.then((info) => this.replaceOverviewText(info));
        earthquakeInfo.then((info) => this.replaceHeaderText(info, sheetType));

        proj4.defs(
            'EPSG:2056',
            '+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs'
        );
    }

    replaceInfoTable(info) {
        const [l, b] = proj4('EPSG:2056', [info.longitude_value, info.latitude_value]);

        [this.infoDate.innerHTML, this.infoTime.innerHTML] = info.time_value?.split('T') || [
            '-',
            '-',
        ];

        this.infoDepth.innerHTML = info.depth_value;
        this.infoIntensity.innerHTML = round(info.magnitude_value, 1);
        this.infoAuswertung.innerHTML = 'automatisch';
        this.infoSwiss.innerHTML = `${round(l, 1)} / ${round(b, 1)}`;
        this.infoMeta.href = 'http://seismo.ethz.ch';
    }

    replaceOverviewText(info) {
        this.overviewMagnitude.innerHTML = info.magnitude_value;
        this.overviewText.innerHTML = info.description_de;
        let warnlevel = 5;
        this.overviewWarnlevels[warnlevel - 1].classList.add('active');
    }

    replaceHeaderText(info, sheetType) {
        let date = moment(info.calculation[0].creationinfo.creationtime);

        this.headerDatetime.innerHTML = date.format('D.MM.YYYY, HH:mm');
        this.headerTitle.innerHTML = info.event_text;
        this.headerKuerzel.innerHTML = sheetType;
        this.headerWappen.src = `images/wappen/${sheetType || 'CH'}.png`;
    }
}

export default RIAInfo;
