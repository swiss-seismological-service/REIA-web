// import { getEarthquake, getHeaderContent } from './utils/api';
// import App from './components/App';
// import Graph from './components/Graph';
// import Header from './components/Header';

// function update(id) {
//     let earthquake = getEarthquake(id);
//     let header = getHeaderContent();

//     const g = new Graph(earthquake);
//     const a = new App(earthquake);
//     const h = new Header(earthquake, header);
// }

// update(1);

// Array.from(document.getElementsByClassName('select-button')).forEach((el) => {
//     let id = parseInt(el.dataset.id, 10);
//     el.addEventListener('click', () => update(id));
// });

import MyCounter from './webcomponents/MyCounter';
import HelloWorld from './webcomponents/HelloWorld';
