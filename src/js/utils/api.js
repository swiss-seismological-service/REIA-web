function getData(url) {
    return fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
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
    return getData(`http://ermd.ethz.ch/v1/earthquake/${originid}`);
}

export function getCasualties(oid, tag) {
    let base = `http://ermd.ethz.ch/v1/loss/${oid}/occupants`;
    if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?aggregation_tag=${tag}`);
}

export function getDisplaced(oid, tag) {
    let base = `http://ermd.ethz.ch/v1/loss/${oid}/businessinterruption`;
    if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?aggregation_tag=${tag}`);
}

export function getBuildingCosts(oid, tag) {
    let base = `http://ermd.ethz.ch/v1/loss/${oid}/structural`;
    if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?aggregation_tag=${tag}`);
}
