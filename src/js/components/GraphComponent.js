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
        this.injuredPromise = loadImage('images/graph_verletzte.png', this.injuredElement);
        this.damagesElement.style.display = 'block';
        this.damagesPromise = loadImage('images/graph_schaden.png', this.damagesElement);
    }
}

export default RIAGraphs;
