function getData(url, apiAddress) {
    // remove trailing slash from apiAddress if present
    apiAddress = apiAddress.endsWith('/') ? apiAddress.slice(0, -1) : apiAddress;

    return fetch(`${apiAddress}${url}`, {
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
            console.error('There has been a problem with your fetch operation:', error); // eslint-disable-line
            return {};
        });
}

export function getOriginInfo(originid, apiAddress = process.env.API_ADDRESS) {
    return getData(`/v1/origin/${originid}`, apiAddress);
}

export function getDangerLevel(originid, apiAddress = process.env.API_ADDRESS) {
    return getData(`/v1/origin/${originid}/dangerlevel`, apiAddress);
}

export function getOriginDescription(originid, lang, apiAddress = process.env.API_ADDRESS) {
    return getData(`/v1/origin/${originid}/description/${lang}`, apiAddress);
}

export function getRiskAssessment(oid, apiAddress = process.env.API_ADDRESS) {
    return getData(`/v1/riskassessment/${oid}`, apiAddress);
}

export function getAllRiskAssessments(
    limit = 20,
    offset = 0,
    apiAddress = process.env.API_ADDRESS
) {
    return getData(`/v1/riskassessment?limit=${limit}&offset=${offset}`, apiAddress);
}

export function getLoss(
    oid,
    type,
    aggregation,
    tag = null,
    sum = false,
    apiAddress = process.env.API_ADDRESS
) {
    let base = `/v1/loss/${oid}/${type}/${aggregation}`;
    if (sum) return getData(`${base}?sum=true`, apiAddress);
    if (tag) return getData(`${base}?filter_tag_like=${tag}`, apiAddress);
    return getData(base, apiAddress);
}

export function getDamage(
    oid,
    type,
    aggregation,
    tag = null,
    sum = false,
    apiAddress = process.env.API_ADDRESS
) {
    let base = `/v1/damage/${oid}/${type}/${aggregation}/report`;
    if (sum) return getData(`${base}?sum=true`, apiAddress);
    if (tag) return getData(`${base}?filter_tag_like=${tag}`, apiAddress);
    return getData(base, apiAddress);
}

export function getCantonalInjuries(oid, apiAddress = process.env.API_ADDRESS) {
    let cantonal = getLoss(oid, 'injured', 'Canton', null, false, apiAddress);
    let country = getLoss(oid, 'injured', 'Canton', null, true, apiAddress);
    return Promise.all([cantonal, country]).then(([ca, co]) => {
        co.forEach((c) => (c.tag = ['CH']));
        return ca.concat(co);
    });
}

export function getCantonalStructuralDamage(oid, apiAddress = process.env.API_ADDRESS) {
    let cantonal = getDamage(oid, 'structural', 'Canton', null, false, apiAddress);
    let country = getDamage(oid, 'structural', 'Canton', null, true, apiAddress);
    return Promise.all([cantonal, country]).then(([ca, co]) => {
        co.forEach((c) => (c.tag = ['CH']));
        return ca.concat(co);
    });
}
