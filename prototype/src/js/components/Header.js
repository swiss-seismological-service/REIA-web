import moment from 'moment';

export default class Header {
    constructor(earthquake, header) {
        this.title = document.getElementById('title');
        this.subtitle = document.getElementById('subtitle');
        this.datetime = document.getElementById('datetime');
        this.logoSED = document.getElementById('logoSED');
        this.logoETH = document.getElementById('logoETH');

        this.earthquake = null;
        this.header = null;

        Promise.all([earthquake, header]).then((values) => {
            [this.earthquake, this.header] = values;
            this.header = this.header['national_assessment.xml'].en;
            this.updateHeader();
        });
    }

    updateHeader = () => {
        // eslint-disable-next-line max-len
        this.title.innerHTML = `${this.header.Title} ${this.earthquake.city} (${this.earthquake.canton})`;
        this.subtitle.innerHTML = this.header.Subtitle;
        this.logoSED.src = `http://localhost${this.header.ImageSED.link}`;
        this.logoETH.src = `http://localhost${this.header.ImageETH.link}`;

        this.datetime.innerHTML = moment(Date.now()).format(this.header.DatetimeFormat);

        setTimeout(() => {
            window.status = 'ready_to_print';
        }, 1000);
    };
}
