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
        this.oid = this.getAttribute('oid');
        this.lossScales = document.querySelectorAll('loss-scale');
        this.lossGraph = document.querySelector('loss-graph');
        this.damageGraph = document.querySelector('damage-graph');
    }

    static get observedAttributes() {
        return ['originid', 'baseurl', 'oid'];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[property] = newValue;

        if (property === 'originid' || property === 'baseurl') {
            this.updateData();
        }

        if (property === 'oid' && newValue) {
            this.promises.push(
                new Promise((resolve) => {
                    resolve(newValue);
                })
            );
        }
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
                    this.setAttribute('oid', oid);

                    await Promise.all(this.promises).then(() => {
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
                lossScale.setData(loss);
                this.promises.push(loss);
            });
        }
    }

    updateLossGraph(lossCalculationOid) {
        if (this.lossGraph) {
            let cantonalInjuries = getCantonalInjuries(lossCalculationOid, this.baseurl);
            this.lossGraph.setData(cantonalInjuries);
            this.promises.push(cantonalInjuries);
        }
    }

    updateDamageGraph(damageCalculationOid) {
        if (this.damageGraph) {
            let cantonStructuralDamage = getCantonalStructuralDamage(
                damageCalculationOid,
                this.baseurl
            );
            this.damageGraph.setData(cantonStructuralDamage);
            this.promises.push(cantonStructuralDamage);
        }
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
