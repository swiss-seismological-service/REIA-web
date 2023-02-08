const SERVER = 'http://ermscenario.ethz.ch/riaws/';
// const SERVER = 'http://localhost:8000/';

function getData(url) {
    return fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Cache-Control': 'public',
        },
        cache: 'no-store',
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
            return {};
        });
}

export function getEarthquake(originid) {
    return getData(`${SERVER}v1/earthquake/${originid}`);
}

export function getAllEarthquakes() {
    return getData(`${SERVER}v1/earthquakes`);
}

export function getCasualties(oid, tag) {
    let base = `${SERVER}v1/loss/${oid}/occupants`;
    if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?aggregation_tag=${tag}`);
}

export function getDisplaced(oid, tag) {
    let base = `${SERVER}v1/loss/${oid}/businessinterruption`;
    if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?aggregation_tag=${tag}`);
}

export function getBuildingCosts(oid, tag) {
    let base = `${SERVER}v1/loss/${oid}/structural`;
    if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?aggregation_tag=${tag}`);
}

export function getInjured(oid, tag) {
    let base = `${SERVER}v1/loss/${oid}/nonstructural`;
    if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?aggregation_tag=${tag}`);
}

export function getStructuralDamage(oid, tag) {
    let base = `${SERVER}v1/damage/${oid}/structural`;
    if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?aggregation_tag=${tag}`);
}

export function getCantonalInjuries(oid) {
    let base = `${SERVER}v1/loss/${oid}/nonstructural/Canton`;
    let cantonal = getData(base);
    let country = getInjured(oid, 'CH');
    return Promise.all([cantonal, country]).then(([ca, co]) => ca.concat([co]));
}

export function getCantonalStructuralDamage(oid) {
    let base = `${SERVER}v1/damage/${oid}/structural/Canton`;
    let cantonal = getData(base);
    let country = getStructuralDamage(oid, 'CH');
    return Promise.all([cantonal, country]).then(([ca, co]) => ca.concat([co]));
}
