import loadImage from '../utils/images';

class RIAGraphs {
    constructor(earthquakeInfo, sheetType) {
        this.injuredElement = document.getElementById('graph-injured');
        this.damagesElement = document.getElementById('graph-damages');

        this.injuredPromise = null;
        this.damagesPromise = null;
        if (sheetType === 'CH') {
            earthquakeInfo.then(() => this.insertGraphs());
        }
    }

    returnPromises = () => [this.injuredPromise, this.damagesPromise];

    insertGraphs() {
        this.injuredElement.style.display = 'block';
        let injuredMapElement = this.injuredElement.getElementsByTagName('img')[0];
        this.injuredPromise = loadImage('images/graph_verletzte.png', injuredMapElement);
        this.damagesElement.style.display = 'block';
        let damagesMapElement = this.damagesElement.getElementsByTagName('img')[0];
        this.damagesPromise = loadImage('images/graph_schaden.png', damagesMapElement);
    }
}

export default RIAGraphs;
