import React, { Component } from 'react';
import './App.css';
import Pin from './pin';

class App extends Component {
  constructor(props) {
    super(props);

    this.addPin = this.addPin.bind(this);
    this.newPin = this.newPin.bind(this);

    this.state = {
      pins: []
    };
  }
  componentDidMount() {

    if (this.state.pins.length === 0) {
      this.addPin();
    }
  }
  addPin(event) {

    event && event.preventDefault();

    this.setState({
      pins: [].concat(this.state.pins.slice(), this.newPin())
    }, () => {

      var pins = this.state.pins.slice()
        .map(pin => {
          pin.redraw = !pin.redraw;

          return pin;
        });

        this.setState({
          pins: pins
        });
    });
  }
  newPin() {

    var name = 'pin';
    var pins = this.state.pins;

    var index = pins.reduce((result, next) => {

      if (next.name.indexOf(name) !== 0) {
        return result;
      }

      return (next.name.length > 3 ? +next.name.substr(3) : result) + 1;
    }, 0);

    return {
      name: name + index,
      redraw: false
    };
  }
  render() {
    return (
      <div className="App">
        <p className="App-intro">
          To get started, press pin and record from microphone or <a href="/add" onClick={this.addPin}>add another pin</a>.
        </p>
        <div className="pins">
          {this.state.pins.map((pin, index) => {
            return <Pin name={pin.name} redraw={pin.redraw} key={index} />
          })}
        </div>
      </div>
    );
  }
}

export default App;
