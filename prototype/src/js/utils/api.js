import 'whatwg-fetch';

export function getEarthquake(id) {
    // let res = fetch(`/api/earthquakes/${id}`, { mode: 'cors' }).then((response) => {
    let res = fetch(`http://localhost:8000/earthquakes/${id}`, { mode: 'cors' }).then(
        (response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        }
    );
    return res;
}

export function getHeaderContent() {
    let res = fetch(
        // `/ocmsApi/json/sites/default/mercury-demo/.content/assessment-m/?wrapper&content`,
        `http://localhost:80/json/sites/default/mercury-demo/.content/assessment-m/?wrapper&content`,
        { mode: 'cors' }
    ).then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
    });
    return res;
}
