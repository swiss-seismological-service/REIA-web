function getData(url, apiAddress, queryParams = null) {
    apiAddress = apiAddress || process.env.API_ADDRESS;
    // remove trailing slash from apiAddress if present
    apiAddress = apiAddress.endsWith('/') ? apiAddress.slice(0, -1) : apiAddress;

    const queryString = new URLSearchParams(queryParams);
    const fullUrl = queryParams ? `${apiAddress}${url}?${queryString}` : `${apiAddress}${url}`;

    return fetch(fullUrl, {
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

export function getOriginInfo(originid, apiAddress = null) {
    return getData(`/v1/origin/${originid}`, apiAddress);
}

export function getDangerLevel(originid, apiAddress = null) {
    return getData(`/v1/origin/${originid}/dangerlevel`, apiAddress);
}

export function getOriginDescription(originid, lang, apiAddress = null) {
    return getData(`/v1/origin/${originid}/description/${lang}`, apiAddress);
}

export function getRiskAssessment(oid, apiAddress = null) {
    return getData(`/v1/riskassessment/${oid}`, apiAddress);
}

export function getAllRiskAssessments(limit = 20, offset = 0, originid = null, apiAddress = null) {
    const queryParams = {
        limit,
        offset,
        ...(originid && { originid }),
    };
    return getData('/v1/riskassessment', apiAddress, queryParams);
}

export function getAllRiskAssessmentsWithFlag(limit = 20, offset = 0, apiAddress = null) {
    const [secretKey, secretValue] = process.env.SECRET.split('=');
    const queryParams = {
        [secretKey]: secretValue,
        limit,
        offset,
    };
    return getData('/v1/riskassessment', apiAddress, queryParams);
}

export function getLoss(oid, type, aggregation, tag = null, sum = false, apiAddress = null) {
    const [secretKey, secretValue] = process.env.SECRET.split('=');
    const queryParams = {
        [secretKey]: secretValue,
        ...(tag && { filter_tag_like: tag }),
        ...(sum && { sum: true }),
    };
    let base = `/v1/loss/${oid}/${type}/${aggregation}`;
    return getData(base, apiAddress, queryParams);
}

export function getDamage(oid, type, aggregation, tag = null, sum = false, apiAddress = null) {
    const [secretKey, secretValue] = process.env.SECRET.split('=');
    const queryParams = {
        [secretKey]: secretValue,
        ...(tag && { filter_tag_like: tag }),
        ...(sum && { sum: true }),
    };
    let base = `/v1/damage/${oid}/${type}/${aggregation}/report`;
    return getData(base, apiAddress, queryParams);
}

export function getCantonalInjuries(oid, apiAddress = null) {
    let cantonal = getLoss(oid, 'injured', 'Canton', null, false, apiAddress);
    let country = getLoss(oid, 'injured', 'Canton', null, true, apiAddress);
    return Promise.all([cantonal, country]).then(([ca, co]) => {
        co.forEach((c) => (c.tag = ['CH']));
        return ca.concat(co);
    });
}

export function getCantonalStructuralDamage(oid, apiAddress = null) {
    let cantonal = getDamage(oid, 'structural', 'Canton', null, false, apiAddress);
    let country = getDamage(oid, 'structural', 'Canton', null, true, apiAddress);
    return Promise.all([cantonal, country]).then(([ca, co]) => {
        co.forEach((c) => (c.tag = ['CH']));
        return ca.concat(co);
    });
}
