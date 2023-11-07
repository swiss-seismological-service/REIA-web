import i18next from 'i18next';
import cantons from '../../data/pictureParamByCanton.csv';
import { b64encode, loadImage } from '../utils/utilities';

class RIAMaps {
    constructor(riskAssessment, sheetType) {
        this.shakemapElement = document.getElementById('map-shakemap');
        this.injuredElement = document.getElementById('map-injured');
        this.damagesElement = document.getElementById('map-damages');
        this.shakemapLegend = document.getElementById('legende-shakemap');
        this.cantonElements = document.querySelectorAll('.info-cant-maps');
        this.shakemapPromise = null;
        this.injuredPromise = null;
        this.damagesPromise = null;
        this.legendPromise = null;

        this.cantons = Object.fromEntries(cantons);

        this.shakemap = process.env.SHAKEMAP;
        this.injuredmap = process.env.INJURED_MAP;
        this.damagemap = process.env.DAMAGE_MAP;
        this.addLegend();
        riskAssessment.then((info) => this.insertMaps(info, sheetType));
    }

    returnPromises = () => [this.shakemapPromise, this.injuredPromise, this.damagesPromise];

    addLegend() {
        this.legendPromise = loadImage(
            `images/legende_shakemap_${i18next.resolvedLanguage}.svg`,
            this.shakemapLegend
        );
    }

    insertMaps(info, sheetType) {
        this.shakemapPromise = loadImage(
            `${this.shakemap}&LOCID='${b64encode(info.originid)}'`,
            this.shakemapElement
        );
        let damage = info.damagecalculation;
        let loss = info.losscalculation;

        this.cantonElements.forEach((span) => {
            span.innerHTML = sheetType;
        });

        if (sheetType !== 'CH') {
            // insert cantonal maps
            this.injuredElement.style.display = 'flex';
            let injuredMapElement = this.injuredElement.getElementsByTagName('img')[0];
            this.injuredPromise = loadImage(
                `${this.injuredmap}&CALCID=${loss._oid}&CANTON=${sheetType}${this.cantons[sheetType]}`,
                injuredMapElement
            );

            this.damagesElement.style.display = 'flex';
            let damagesMapElement = this.damagesElement.getElementsByTagName('img')[0];
            this.damagesPromise = loadImage(
                `${this.damagemap}&CALCID=${damage._oid}&CANTON=${sheetType}${this.cantons[sheetType]}`,
                damagesMapElement
            );
        }
    }
}
export default RIAMaps;
