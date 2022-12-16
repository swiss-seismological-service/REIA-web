export default function getLatestCalculation(earthquakeInfo, risktype) {
    let calc = earthquakeInfo.calculation.filter((c) => c._type === risktype);
    calc = calc
        .sort(
            (a, b) => new Date(b.creationinfo.creationtime) - new Date(a.creationinfo.creationtime)
        )
        .shift();
    return calc;
}
