import { getEarthquake } from './utils/api';
import MyCounter from './webcomponents/MyCounter';
import LossPeople from './webcomponents/LossPeople';
import LossDisplaced from './webcomponents/LossDisplaced';
import LossBuildings from './webcomponents/LossBuildings';
import RIAInfo from './components/InfoComponent';
import RIAScale from './components/ScaleComponent';

const earthquakeInfo = getEarthquake('c21pOmNoLmV0aHouc2VkL3NjZW5hcmlvL09yaWdpbi9BYXJhdV9NNl8w');

const info = new RIAInfo(earthquakeInfo, 'CH');
const scales = new RIAScale(earthquakeInfo, 'CH');
