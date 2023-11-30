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
        this.promises = [];
        this.lossScales = document.querySelectorAll('loss-scale');
        this.lossGraph = document.querySelector('loss-graph');
        this.damageGraph = document.querySelector('damage-graph');
    }

    static get observedAttributes() {
        return ['originid', 'baseurl'];
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
                    const lossCalculationOid = data.losscalculation._oid;
                    const damageCalculationOid = data.damagecalculation._oid;
                    const oid = data._oid;

                    this.updateLossScales(lossCalculationOid);
                    this.updateLossGraph(lossCalculationOid);
                    this.updateDamageGraph(damageCalculationOid);
                    this.updateOid(oid);

                    Promise.all(this.promises).then(() => {
                        const event = new CustomEvent('data-ready');
                        this.dispatchEvent(event);
                    });
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
                const loss = getLoss(
                    lossCalculationOid,
                    lossCategory,
                    'Canton',
                    null,
                    true,
                    this.baseurl
                );
                this.promises.push(loss);
                lossScale.setData(loss);
            });
        }
    }

    updateLossGraph(lossCalculationOid) {
        if (this.lossGraph) {
            let cantonalInjuries = getCantonalInjuries(lossCalculationOid, this.baseurl);
            this.promises.push(cantonalInjuries);
            this.lossGraph.setData(cantonalInjuries);
        }
    }

    updateDamageGraph(damageCalculationOid) {
        if (this.damageGraph) {
            let cantonStructuralDamage = getCantonalStructuralDamage(
                damageCalculationOid,
                this.baseurl
            );
            this.promises.push(cantonStructuralDamage);
            this.damageGraph.setData(cantonStructuralDamage);
        }
    }

    updateOid(oid) {
        const promise = new Promise((resolve) => {
            this.setAttribute('oid', oid);
            resolve('oid updated');
        });

        this.promises.push(promise);
    }

    async fetchRiskAssessmentData() {
        try {
            const riskAssessments = await getAllRiskAssessments(20, 0, this.originid, this.baseurl);
            const preferred = riskAssessments.items.filter(
                (item) => item.preferred && item.published
            );

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
