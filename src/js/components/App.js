import moment from 'moment';

export default class App {
    constructor(data) {
        this.icons = document.getElementsByClassName('loss__icons');
        this.data = null;
        data.then((d) => {
            this.data = d;
            this.selectIcon();
            this.setData();
        });
    }

    selectIcon = () => {
        const thresholds = [50, 100, 500, 1000];

        Array.from(this.icons).forEach((el) => {
            el.classList.remove('active');
        });

        if (
            !thresholds.some((tr, idx) => {
                if (!(this.data.human_losses > tr)) {
                    this.icons[idx].classList.add('active');
                    return true;
                }
                return false;
            })
        ) {
            this.icons[this.icons.length - 1].classList.add('active');
        }
    };

    setData = () => {
        document.getElementById('gefahrenstufe').innerHTML = this.data.danger_level;
        document.getElementById('magnitude').innerHTML = `Magnitude ${this.data.magnitude} [MLhc]`;
        document.getElementById(
            'lonlat'
        ).innerHTML = `${this.data.latitude} / ${this.data.longitude}`;
        document.getElementById('time').innerHTML = moment(this.data.datetime).format(
            'HH:mm [Uhr]'
        );
        document.getElementById('date').innerHTML = moment(this.data.datetime).format('DD.MM.YYYY');
        document.getElementById('depth').innerHTML = this.data.depth;
        document.getElementById('intensity').innerHTML = this.data.intensity;
        document.getElementById('swiss').innerHTML = 'swiss coordinates';
        document.getElementById('meta').innerHTML = this.data.meta;
    };
}
