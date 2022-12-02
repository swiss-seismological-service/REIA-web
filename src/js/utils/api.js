// export function getEarthquake(originid) {
//     const f = fetch(`http://ermd.ethz.ch/v1/earthquake/${originid}`, {
//         method: 'GET',
//         headers: {
//             Accept: 'application/json',
//         },
//     })
//         .then((response) => {
//             if (!response.ok) {
//                 throw new Error('Network response was not OK');
//             }
//             return response.json();
//         })
//         .then((data) => ({ data }))
//         .catch((error) => {
//             console.error('There has been a problem with your fetch operation:', error);
//             return {};
//         });

//     return f;
// }

export function getEarthquake(originid) {
    const f = fetch(`http://ermd.ethz.ch/v1/earthquake/${originid}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    }).then((data) => data.json());

    return f;
}

export function getSomething() {
    return 'something';
}
