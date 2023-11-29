import {
    getAllRiskAssessments,
    getLoss,
    getCantonalInjuries,
    getCantonalStructuralDamage,
} from '../utils/api';

class DataLoader extends HTMLElement {
    constructor() {
        super();
        this.originid = null;
        this.baseurl = null;
        this.oid = null;
        this.lossScales = document.querySelectorAll('loss-scale');
        this.lossGraph = document.querySelector('loss-graph');
        this.damageGraph = document.querySelector('damage-graph');
    }

    static get observedAttributes() {
        return ['originid', 'baseurl', 'oid'];
    }

    connectedCallback() {
        this.updateData();
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[property] = newValue;
        this.updateData();
    }

    async updateData() {
        if (this.originid && this.baseurl) {
            try {
                const data = await this.fetchRiskAssessmentData();

                if (data) {
                    this.setAttribute('oid', data._oid);
                    const lossCalculationOid = data.losscalculation._oid;
                    const damageCalculationOid = data.damagecalculation._oid;
                    this.updateLossScales(lossCalculationOid);
                    this.updateLossGraph(lossCalculationOid);
                    this.updateDamageGraph(damageCalculationOid);
                }
            } catch (error) {
                console.error('Error fetching or updating data:', error);
            }
        }
    }

    updateLossScales(lossCalculationOid) {
        if (this.lossScales.length > 0) {
            this.lossScales.forEach((lossScale) => {
                const lossCategory = lossScale.getAttribute('losscategory');
                lossScale.setData(
                    getLoss(lossCalculationOid, lossCategory, 'Canton', null, true, this.baseurl)
                );
            });
        }
    }

    updateLossGraph(lossCalculationOid) {
        if (this.lossGraph) {
            this.lossGraph.setData(getCantonalInjuries(lossCalculationOid, this.baseurl));
        }
    }

    updateDamageGraph(damageCalculationOid) {
        if (this.damageGraph) {
            this.damageGraph.setData(
                getCantonalStructuralDamage(damageCalculationOid, this.baseurl)
            );
        }
    }

    async fetchRiskAssessmentData() {
        try {
            const data = await getAllRiskAssessments(20, 0, this.originid, this.baseurl);
            const preferred = data.items.filter((item) => item.preferred && item.published);

            if (preferred.length > 1) {
                return preferred.reduce((latest, current) =>
                    new Date(current.creationinfo.creationtime) >
                    new Date(latest.creationinfo.creationtime)
                        ? current
                        : latest
                );
            }

            if (preferred.length === 0) {
                console.warn('No published and preferred risk assessment found for this origin id');
                return null;
            }

            return preferred[0];
        } catch (error) {
            console.error('Error fetching risk assessment data:', error);
            throw error;
        }
    }
}

customElements.define('data-loader', DataLoader);
