import { getAllRiskAssessments, getLoss, getCantonalInjuries, getCantonalStructuralDamage } from "../utils/api";

class DataLoader extends HTMLElement {
  
    static get observedAttributes() {
        return ['originId', 'baseUrl'];
    }

    connectedCallback() {
        const originId = this.getAttribute('originId');
        const baseUrl = this.getAttribute('baseUrl');

        if (!originId || !baseUrl) {
            console.error('Missing required attributes: originId or baseUrl');
            return;
        }

        const fetchRiskAssessmentData = async () => {
            try {
                const data = await getAllRiskAssessments(20, 0, originId, baseUrl);
                return data.items.slice(-1);
            } catch (error) {
                console.error('Error fetching risk assessment data:', error);
                return [];
            }
        };

        fetchRiskAssessmentData()
            .then((data) => {
                if (data.length > 0) {
                    const lossCalculationOid = data[0].losscalculation._oid;
                    const damageCalculationOid = data[0].damagecalculation._oid;

                    const setLossData = (lossScale) => {
                        lossScale.setData(
                            getLoss(lossCalculationOid, lossScale.getAttribute('losscategory'), 'Canton', null, false, baseUrl)
                        );
                    };

                    document.querySelectorAll('loss-scale').forEach(setLossData);
                    document.querySelector('loss-graph').setData(getCantonalInjuries(lossCalculationOid, baseUrl));
                    document.querySelector('damage-graph').setData(getCantonalStructuralDamage(damageCalculationOid, baseUrl));
                } else {
                    console.warn('No data available for the provided originId.');
                }
            })
            .catch((error) => {
                console.error('Error processing fetched data:', error);
            });
    }
}

customElements.define('data-loader', DataLoader);