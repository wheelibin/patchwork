import React, { Component } from "react";
import "./App.css";
import Rack from "./Rack";
import moduleDB from "./modules.json";
import * as patch from "./patch";
import * as patchbook from "./patchbook/patchbook";

const moduleHeight = 500;
const parsedPatchbook = patchbook.parse(patch.patchbook);

class App extends Component {
  render() {
    return (
      <div className="App">
        <Rack patch={parsedPatchbook} modules={moduleDB} moduleHeight={moduleHeight} spacing={0} />
      </div>
    );
  }
}

export default App;
