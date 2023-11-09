import i18next from 'i18next';
import cantonParamsCSV from '../../data/pictureParamByCanton.csv';
import {
    getCantonalInjuries,
    getCantonalStructuralDamage,
    getLoss,
    getOriginInfo,
    getDangerLevel,
    getOriginDescription,
} from '../utils/api';
import {
    parseUTCDate,
    formatDate,
    formatTime,
    b64encode,
    round,
    loadImage,
} from '../utils/utilities';

class DataComponent {
    constructor(riskAssessment, sheetType) {
        this.promises = [];

        riskAssessment.then((info) => {
            let lossId = info.losscalculation?._oid;
            let damageId = info.damagecalculation?._oid;
            let originId = info.originid;

            if (lossId && damageId) {
                this.addScaleData(lossId, sheetType);
                this.addGraphData(lossId, damageId, sheetType);
                this.insertMaps(lossId, damageId, originId, sheetType);
            }

            this.addHeaderInfo(info, sheetType);

            if (originId) {
                this.addOriginInfo(originId);
                this.addOriginDescription(originId);
                this.addDangerLevel(originId);
            }
        });
    }

    returnPromises = () => this.promises;

    addGraphData = (lossId, damageId, sheetType) => {
        let lossGraph = document.getElementById('loss-graph');
        let damageGraph = document.getElementById('damage-graph');
        if (sheetType === 'CH') {
            lossGraph.parentElement.parentElement.style.display = 'block';
            damageGraph.parentElement.parentElement.style.display = 'block';
        }

        lossGraph.setAttribute('language', i18next.language);
        let lossgraphPromise = getCantonalInjuries(lossId);
        lossGraph.setData(lossgraphPromise);
        this.promises.push(lossgraphPromise);

        damageGraph.setAttribute('language', i18next.language);
        let damagegraphPromise = getCantonalStructuralDamage(damageId);
        damageGraph.setData(damagegraphPromise);
        this.promises.push(damagegraphPromise);
    };

    addScaleData(lossId, sheetType) {
        let fatalities = document.getElementById('loss-casualties');
        let displaced = document.getElementById('loss-displaced');
        let structural = document.getElementById('loss-buildingcosts');

        let overviewPlaces = document.getElementsByClassName('overview-place');
        let tag = sheetType === 'CH' ? null : sheetType;
        let sum = sheetType === 'CH';

        fatalities.setAttribute('language', i18next.language);
        fatalities.setAttribute('losscategory', 'fatalities');
        let fatalitiesPromise = getLoss(lossId, 'fatalities', 'Canton', tag, sum);
        fatalities.setData(fatalitiesPromise);
        this.promises.push(fatalitiesPromise);

        displaced.setAttribute('language', i18next.language);
        displaced.setAttribute('losscategory', 'displaced');
        let displacedPromise = getLoss(lossId, 'displaced', 'Canton', tag, sum);
        displaced.setData(displacedPromise);
        this.promises.push(displacedPromise);

        structural.setAttribute('language', i18next.language);
        structural.setAttribute('losscategory', 'structural');
        let structuralPromise = getLoss(lossId, 'structural', 'Canton', tag, sum);
        structural.setData(structuralPromise);
        this.promises.push(structuralPromise);

        Array.from(overviewPlaces).forEach((el) => {
            el.innerHTML =
                sheetType === 'CH'
                    ? i18next.t('national-schweiz')
                    : `${i18next.t('national-kanton')} ${sheetType}`;
        });
    }

    addOriginInfo(originId) {
        let headerTitle = document.getElementById('header-title');
        let overviewMagnitude = document.getElementById('overview-magnitude');
        let infoTable = document.getElementById('info-table');

        this.promises.push(
            getOriginInfo(b64encode(originId)).then((originInfo) => {
                infoTable.setAttribute('originId', originId);
                infoTable.setAttribute('originInfo', JSON.stringify(originInfo));

                overviewMagnitude.innerHTML = `${round(originInfo.magnitude, 1) || '-'} [${
                    originInfo.magnitudetype || ''
                }]`;

                let canton = originInfo.region.split(' ').pop();
                // remove last occurrence of "canton" abbreviation and add it in brackets
                originInfo.region = `${originInfo.region.replace(
                    new RegExp(`${canton}$`),
                    ''
                )}(${canton})`;

                headerTitle.innerHTML = i18next.t('preposition_title', {
                    name: originInfo.region || '-',
                });
            })
        );
    }

    addHeaderInfo(info, sheetType) {
        let headerDatetime = document.getElementById('header-datetime');
        let headerWappen = document.getElementById('header-wappen');
        let headerKuerzel = document.getElementById('header-kuerzel');

        let date = parseUTCDate(info?.creationinfo?.creationtime);
        headerDatetime.innerHTML = date ? `${formatDate(date)}, ${formatTime(date)}` : '';

        headerKuerzel.innerHTML = sheetType;
        headerWappen.src = `images/wappen/${sheetType || 'CH'}.png`;
    }

    addOriginDescription(originId) {
        let overviewText = document.getElementById('overview-text');
        this.promises.push(
            getOriginDescription(b64encode(originId), i18next.resolvedLanguage).then(
                (description) => {
                    overviewText.innerHTML = description.description || '';
                }
            )
        );
    }

    addDangerLevel(originId) {
        let overviewWarnlevels = document.getElementsByClassName('overview__stufe__number');
        this.promises.push(
            getDangerLevel(b64encode(originId)).then((warnlevel) => {
                warnlevel = Math.max(1, warnlevel[0]?.alarmlevel);
                overviewWarnlevels[(warnlevel || 1) - 1].classList.add('active');
                overviewWarnlevels[(warnlevel || 1) - 1].innerHTML = warnlevel || '-';
            })
        );
    }

    insertMaps(lossId, damageId, originId, sheetType) {
        let shakemapElement = document.getElementById('map-shakemap');
        let injuredElement = document.getElementById('map-injured');
        let damagesElement = document.getElementById('map-damages');
        let cantonElements = document.querySelectorAll('.info-cant-maps');
        let cantonParams = Object.fromEntries(cantonParamsCSV);

        cantonElements.forEach((span) => {
            span.innerHTML = sheetType;
        });

        this.promises.push(
            loadImage(`${process.env.SHAKEMAP}&LOCID='${b64encode(originId)}'`, shakemapElement)
        );

        if (sheetType !== 'CH') {
            // insert cantonal maps
            injuredElement.style.display = 'flex';
            let injuredMapElement = injuredElement.getElementsByTagName('img')[0];
            this.promises.push(
                loadImage(
                    `${process.env.INJURED_MAP}&CALCID=${lossId}&CANTON=${sheetType}${cantonParams[sheetType]}`,
                    injuredMapElement
                )
            );

            damagesElement.style.display = 'flex';
            let damagesMapElement = damagesElement.getElementsByTagName('img')[0];
            this.promises.push(
                loadImage(
                    `${process.env.DAMAGE_MAP}&CALCID=${damageId}&CANTON=${sheetType}${cantonParams[sheetType]}`,
                    damagesMapElement
                )
            );
        }
    }
}
export default DataComponent;
