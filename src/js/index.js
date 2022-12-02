import { getEarthquake } from './utils/api';
import MyCounter from './webcomponents/MyCounter';
import LossPeople from './webcomponents/LossPeople';
import LossDisplaced from './webcomponents/LossDisplaced';
import LossBuildings from './webcomponents/LossBuildings';
import RIAInfo from './components/InfoComponent';

const earthquakeInfo = getEarthquake('c21pOmNoLmV0aHouc2VkL3NjZW5hcmlvL09yaWdpbi9BYXJhdV9NNl8w');

const info = new RIAInfo(earthquakeInfo, 'CH');
