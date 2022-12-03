export default function injectSVG(path, element) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    xhr.overrideMimeType('image/svg+xml');
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            element.appendChild(xhr.responseXML.documentElement);
        }
    };
    xhr.send();
}
