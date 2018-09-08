import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
// import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import "./App.css";
import Rack from "./Rack";
import PatchBookEditor from "./components/PatchBookEditor";
import moduleDB from "./modules.json";

import * as patch from "./patch";
import * as patchbook from "./patchbook/patchbook";

const moduleHeight = 400;

// const theme = createMuiTheme();

class App extends Component {
  constructor() {
    super();
    this.state = {
      markup: patch.patch1,
      patch: {},
      rackContainerWidth: 0
    };
  }
  componentDidMount() {
    this.setState({ patch: patchbook.parse(this.state.markup) });
  }
  setRackContainerRef = element => {
    this.setState({ rackContainerWidth: element.clientWidth });
  };
  handleMarkupChanged = markup => {
    const parsedPatchbook = patchbook.parse(markup);
    this.setState({ markup: markup, patch: parsedPatchbook });
  };
  render() {
    let rack = null;
    if (this.state.rackContainerWidth) {
      rack = <Rack patch={this.state.patch} modules={moduleDB} moduleHeight={moduleHeight} spacing={0} rackWidth={this.state.rackContainerWidth} />;
    }
    return (
      // <MuiThemeProvider theme={theme}>
      <div className="App">
        <Grid container spacing={24}>
          <Grid item xs={12} sm={4}>
            <PatchBookEditor markup={this.state.markup} onMarkupChanged={this.handleMarkupChanged} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <div id="rack-container" ref={this.setRackContainerRef}>
              {rack}
            </div>
          </Grid>
        </Grid>
      </div>
    );
    // </MuiThemeProvider>
  }
}

export default App;
