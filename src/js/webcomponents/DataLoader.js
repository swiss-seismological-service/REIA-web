/* eslint-disable max-len */
import { getAllRiskAssessments, 
         getLoss, 
         getCantonalInjuries, 
         getCantonalStructuralDamage } from "../utils/api";

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
               
                const preferred = data.items.filter((item) => item.preferred && item.published);
               
                
                if (preferred.length > 1) {
                    return preferred.reduce((latest, current) =>
                    new Date(current.creationinfo.creationtime) > new Date(latest.creationinfo.creationtime) ? current : latest);
                } 

                return preferred;
            
            } catch (error) {
                console.error('Error fetching risk assessment data:', error);
                throw error;
            }
        };




        fetchRiskAssessmentData()
            .then((data) => {
                if (data.length === 1) {
                    const lossCalculationOid = data.map(d=>d.losscalculation._oid);
                    const damageCalculationOid = data.map( d=>d.damagecalculation._oid);

                    const setLossData = (lossScale) => {
                        lossScale.setData(
                            getLoss(lossCalculationOid, 
                                    lossScale.getAttribute('losscategory'), 
                                    'Canton', 
                                    null, 
                                    false, 
                                    baseUrl)
                        );
                    };

                    // Loss scales
                    document.querySelectorAll('loss-scale')
                            .forEach(setLossData);

                    // Loss graph
                    document.querySelector('loss-graph')
                            .setData(getCantonalInjuries(lossCalculationOid, baseUrl));

                    // Damage graph
                    document.querySelector('damage-graph')
                            .setData(getCantonalStructuralDamage(damageCalculationOid, baseUrl));

                } else if (data.length > 1) {

                    console.warn('Multiple risk assessments found for the provided originId with the same creationinfo');

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