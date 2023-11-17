/* eslint-disable no-console */

import { getAllRiskAssessments, getLoss, getDamage, getCantonalInjuries, getCantonalStructuralDamage } from "../utils/api";


class DataLoader extends HTMLElement {
    constructor() {
        super();
        this.promises = [];
    }

    // component attributes
    static get observedAttributes() {
        return ['originId', 'baseUrl'];
    }
    
    
    connectedCallback() {

        // Load data for a given origin id
        // eslint-disable-next-line max-len
        let riskAssessmentData = getAllRiskAssessments(20, 0, this.getAttribute('originId'), this.getAttribute('baseUrl'))
                        // eslint-disable-next-line max-len
                        .then((data) => data.items.slice(-1));
        
        riskAssessmentData.then((data) => {

            // Get the loss calculation oid
            let lossCalculationOid = data.map(d => d.losscalculation._oid)[0];
            let damageCalculationOid = data.map(d => d.damagecalculation._oid)[0];


            // Loss scales
            document.querySelectorAll('loss-scale').forEach((lossScale) => {
                // eslint-disable-next-line max-len
                lossScale.setData(getLoss(lossCalculationOid,lossScale.getAttribute('losscategory'), 'Canton', null, false, this.getAttribute('baseUrl')));
            })

            // Loss graph
            // eslint-disable-next-line max-len
            document.querySelector('loss-graph').setData(getCantonalInjuries(lossCalculationOid, this.getAttribute('baseUrl')))
          

            // Damage graph
            // eslint-disable-next-line max-len
            document.querySelector('damage-graph').setData(getCantonalStructuralDamage(damageCalculationOid, this.getAttribute('baseUrl')));
            ;

        });
        
    }
    }
     
    
customElements.define('data-loader', DataLoader);
