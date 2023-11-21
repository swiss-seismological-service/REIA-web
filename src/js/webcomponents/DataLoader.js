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
    }

    static get observedAttributes() {
        return ['originid', 'baseurl'];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;

        this[property] = newValue;
    }

    connectedCallback() {
        this.updateData();
    }

    updateData = () => {
        if (this.originid && this.baseurl) {
            const lossScales = document.querySelectorAll('loss-scale');
            const lossGraph = document.querySelector('loss-graph');
            const damageGraph = document.querySelector('damage-graph');

            this.fetchRiskAssessmentData().then((data) => {
                if (data) {
                    const lossCalculationOid = data[0].losscalculation._oid;
                    const damageCalculationOid = data[0].damagecalculation._oid;

                    if (lossScales) {
                        lossScales.forEach((lossScale) => {
                            this.setLossData(
                                lossScale,
                                lossScale.getAttribute('losscategory'),
                                lossCalculationOid,
                                this.baseurl
                            );
                        });
                    }

                    if (lossGraph) {
                        lossGraph.setData(getCantonalInjuries(lossCalculationOid, this.baseurl));
                    }

                    if (damageGraph) {
                        damageGraph.setData(
                            getCantonalStructuralDamage(damageCalculationOid, this.baseurl)
                        );
                    }
                }
            });
        }
    };

    setLossData = (lossScale, lossScaleCategory, lossCalculationOid, baseUrl) => {
        lossScale.setData(
            getLoss(lossCalculationOid, lossScaleCategory, 'Canton', null, true, baseUrl)
        );
    };

    fetchRiskAssessmentData = async () => {
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
                console.warn('No risk assessment found');
                return null;
            }

            return preferred;
        } catch (error) {
            console.error('Error fetching risk assessment data:', error);
            throw error;
        }
    };
}

customElements.define('data-loader', DataLoader);
