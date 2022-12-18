import cantons from '../../data/pictureParamByCanton.csv';
import { b64encode } from '../utils/b64';
import getLatestCalculation from '../utils/data';
import loadImage from '../utils/images';

class RIAMaps {
    constructor(earthquakeInfo, sheetType) {
        this.shakemapElement = document.getElementById('map-shakemap');
        this.injuredElement = document.getElementById('map-injured');
        this.damagesElement = document.getElementById('map-damages');
        this.cantonElements = document.querySelectorAll('.info-cant-maps');
        this.shakemapPromise = null;
        this.injuredPromise = null;
        this.damagesPromise = null;

        this.cantons = Object.fromEntries(cantons);

        this.shakemap =
            'http://map.seddb20d.ethz.ch/cache2w/cgi-bin/mapserv?MAP=/var/www/mapfile/sed/erm_ch23_ria_pdf.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=shaded_relief_ch,rivers_white_ch,abroad_gray_ch,border_gray_ch_eu,groundmotion_ch,lakes_white,cities_ch,scenario_marker&SRS=EPSG:21781&BBOX=484748.79762324126,69964.73833242332,837297.2806067152,304997.060321406&WIDTH=600&HEIGHT=400&FORMAT=aggpng24';
        this.injuredmap =
            'http://map.seddb20d.ethz.ch/cache2w/cgi-bin/mapserv?MAP=/var/www/mapfile/sed/erm_ch23_ria_pdf.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=shaded_relief_ch,rivers_white_ch,abroad_gray_ch,border_gray_ch_eu,injured_municipalities_canton_calcid,lakes_white,names_erm_ch23&FORMAT=aggpng24';
        this.damagemap =
            'http://map.seddb20d.ethz.ch/cache2w/cgi-bin/mapserv?MAP=/var/www/mapfile/sed/erm_ch23_ria_pdf.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=shaded_relief_ch,rivers_white_ch,abroad_gray_ch,border_gray_ch_eu,damage_municipalities_canton_calcid,lakes_white,names_erm_ch23&FORMAT=aggpng24';

        earthquakeInfo.then((info) => this.insertMaps(info, sheetType));
    }

    returnPromises = () => [this.shakemapPromise, this.injuredPromise, this.damagesPromise];

    insertMaps(info, sheetType) {
        this.shakemapPromise = loadImage(
            `${this.shakemap}&LOCID='${b64encode(info.originid)}'`,
            this.shakemapElement
        );
        let damage = getLatestCalculation(info, 'damage');
        let loss = getLatestCalculation(info, 'loss');

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
