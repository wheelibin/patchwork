import React, { Component } from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";

import "./App.css";
import Rack from "./components/Rack";
import PatchBookEditor from "./components/PatchBookEditor";
import RackToolbar from "./components/RackToolbar";
import moduleDB from "./modules.json";

import * as patch from "./patch";
import * as patchbook from "./patchbook/patchbook";
import { Paper, Typography } from "@material-ui/core";

const styles = theme => ({
  app: {
    overflowX: "hidden",
    overflowY: "hidden"
  },
  appBar: {
    width: "calc(100% - 12px)"
  },
  infoText: {
    marginTop: 12,
    display: "block",
    height: 36
  }
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      markup: patch.mathsBouncingBall,
      patch: {},
      rackContainerWidth: 0,
      moduleHeight: 400,
      displayVoices: [],
      infoText: ""
    };
  }
  componentDidMount() {
    const patch = patchbook.parse(this.state.markup);
    this.setState({ patch: patchbook.parse(this.state.markup), displayVoices: patch.voices.map(v => v.name) });
  }
  setRackContainerRef = element => {
    this.setState({ rackContainerWidth: element.clientWidth });
  };
  handleMarkupChanged = markup => {
    const parsedPatchbook = patchbook.parse(markup);
    this.setState({ markup: markup, patch: parsedPatchbook });
  };
  handleRackZoom = value => {
    this.setState({ moduleHeight: value });
  };
  handleVoiceToggle = e => {
    const { checked, value } = e.target;
    if (checked) {
      this.setState({ displayVoices: [...this.state.displayVoices, value] });
    } else {
      this.setState({ displayVoices: this.state.displayVoices.filter(v => v !== value) });
    }
  };
  // handleJackClick = jack => {
  //   this.setState({ infoText: `[${jack.type}] ${jack.module}::${jack.jack}` });
  // };
  render() {
    const { classes } = this.props;
    let rack = null;
    if (this.state.rackContainerWidth) {
      rack = (
        <Rack
          patch={this.state.patch}
          moduleDb={moduleDB}
          moduleHeight={this.state.moduleHeight}
          spacing={0}
          rackWidth={this.state.rackContainerWidth}
          displayVoices={this.state.displayVoices}
          // onJackClick={this.handleJackClick}
        />
      );
    }
    return (
      <div className={classes.app}>
        <Grid container spacing={24}>
          <Grid item xs={12} sm={4}>
            <PatchBookEditor markup={this.state.markup} onMarkupChanged={this.handleMarkupChanged} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <RackToolbar
              zoomLevel={this.state.moduleHeight}
              onZoom={this.handleRackZoom}
              onVoiceToggle={this.handleVoiceToggle}
              patch={this.state.patch}
              displayVoices={this.state.displayVoices}
            />

            {/* <Typography className={classes.infoText} variant="caption">
              {this.state.infoText}
            </Typography> */}

            <div id="rack-container" ref={this.setRackContainerRef}>
              {rack}
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
