import React from "react";
import { render } from "react-dom";
import { Scene, Entity } from "aframe-react";

class App extends React.Component {
  render() {
    var myDate = new Date();
    var hrs = myDate.getHours();
    var greet;
    if (hrs < 12) greet = "Good Morning";
    else if (hrs >= 12 && hrs <= 17) greet = "Good Afternoon";
    else if (hrs >= 17 && hrs <= 24) greet = "Good Evening";
    return (
      <Scene>
        <Entity
          primitive="a-text"
          font="mozillavr"
          value={greet}
          color="black"
          position="-.85 1.85 -3"
        />
      </Scene>
    );
  }
}

render(<App />, document.getElementById("root"));
