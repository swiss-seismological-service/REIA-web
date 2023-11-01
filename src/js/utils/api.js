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

export function getOriginInfo(originid) {
    return getData(`${process.env.API_ADDRESS}/v1/origin/${originid}`);
}

export function getDangerLevel(originid) {
    return getData(`${process.env.API_ADDRESS}/v1/origin/${originid}/dangerlevel`);
}

export function getOriginDescription(originid, lang) {
    return getData(`${process.env.API_ADDRESS}/v1/origin/${originid}/description/${lang}`);
}

export function getRiskAssessment(oid) {
    return getData(`${process.env.API_ADDRESS}/v1/riskassessment/${oid}`);
}

export function getAllRiskAssessments(limit = 20, offset = 0) {
    return getData(`${process.env.API_ADDRESS}/v1/riskassessment?limit=${limit}&offset=${offset}`);
}

export function getCasualties(oid, aggregation, tag = null, sum = false) {
    let base = `${process.env.API_ADDRESS}/v1/loss/${oid}/fatalities`;
    if (sum) if (tag === 'CH') return getData(`${base}/Country`);
    return getData(`${base}/Canton?filter_tag_like=${tag}`);
}

export function getLoss(oid, type, aggregation, tag = null, sum = false) {
    let base = `${process.env.API_ADDRESS}/v1/loss/${oid}/${type}/${aggregation}`;
    if (sum) return getData(`${base}?sum=true`);
    if (tag) return getData(`${base}?filter_tag_like=${tag}`);
    return getData(base);
}

export function getDamage(oid, type, aggregation, tag = null, sum = false) {
    let base = `${process.env.API_ADDRESS}/v1/damage/${oid}/${type}/${aggregation}/report`;
    if (sum) return getData(`${base}?sum=true`);
    if (tag) return getData(`${base}?filter_tag_like=${tag}`);
    return getData(base);
}

export function getCantonalInjuries(oid) {
    let cantonal = getLoss(oid, 'injured', 'Canton');
    let country = getLoss(oid, 'injured', 'Canton', null, true);
    return Promise.all([cantonal, country]).then(([ca, co]) => {
        co.forEach((c) => (c.tag = ['CH']));
        return ca.concat(co);
    });
}

export function getCantonalStructuralDamage(oid) {
    let cantonal = getDamage(oid, 'structural', 'Canton');
    let country = getDamage(oid, 'structural', 'Canton', null, true);
    return Promise.all([cantonal, country]).then(([ca, co]) => {
        co.forEach((c) => (c.tag = ['CH']));
        return ca.concat(co);
    });
}
