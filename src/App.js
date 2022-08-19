import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import "./App.css";
import { db } from "./db";
import Pin from "./Pin";

const App = () => {
  
  const pins = useLiveQuery(() => db.pins.toArray()) ?? [];

  const addPin = async (event) => {
    event?.preventDefault();
    await db.pins.add({ name: "track_" + pins.length });
  };

  return (
    <div className="app">
      <p className="app-header">
        <button onClick={addPin}>Add Track</button>
      </p>
      <div className="pins">
        {pins.map((pin, index) => {
          return <Pin name={pin.name} redraw={pin.redraw} key={index} />;
        })}
      </div>
    </div>
  );
};

export default App;
