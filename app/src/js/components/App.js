import React from 'react';
import 'whatwg-fetch';

class App extends React.Component {
    state = {
        name: 'unknown',
        data: null,
    };

    ENDPOINT = 'https://jsonplaceholder.typicode.com/users/';

    componentDidMount = () => {
        console.log('hi');
    };

    getUsers = () =>
        fetch(this.ENDPOINT)
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then((json) => json);

    myFunction = () => {
        this.getUsers().then((json) => this.setState({ name: json[0].name, data: json }));
    };

    render() {
        const { name, data } = this.state;
        return (
            <div>
                <h1>Hi {name}</h1>
                Hello World
                <br />
                <button type="button" onClick={this.myFunction}>
                    Button
                </button>
                {data ? data.map((person) => <p>{person.name}</p>) : ''}
            </div>
        );
    }
}

export default App;
