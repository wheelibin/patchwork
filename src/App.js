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
import { Typography, Snackbar } from "@material-ui/core";

const styles = theme => ({
  app: {
    overflowX: "hidden",
    overflowY: "hidden"
  },
  appBar: {
    width: "calc(100% - 12px)"
  },
  jackClickInfoTypography: {
    display: "inline-block",
    marginRight: 12
  },
  jackClickInfo_Module: {
    color: theme.palette.secondary.light
  },
  jackClickInfo_Jack: {
    color: theme.palette.grey[50]
  },
  jackClickInfo_Type: {
    color: theme.palette.grey[50]
  }
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      markup: patch.patch1,
      patch: {},
      rackContainerWidth: 0,
      moduleHeight: 255,
      displayVoices: [],
      jackClickedInfo: "",
      jackClickedInfoOpen: false,
      selectedVoiceModulesOnly: false
    };
  }
  componentDidMount() {
    const patch = patchbook.parse(this.state.markup);
    this.setState({ patch: patchbook.parse(this.state.markup), displayVoices: patch.voices.map(v => v.name) });
  }
  handleMarkupChanged = markup => {
    const newPatch = patchbook.parse(markup);

    const newVoices = newPatch.voices.reduce((result, newPatchVoice) => {
      if (!this.state.patch.voices.find(v => v.name === newPatchVoice.name)) {
        result.push(newPatchVoice.name);
      }
      return result;
    }, []);

    const displayVoices = [...this.state.displayVoices];
    displayVoices.push(...newVoices);

    this.setState({ markup: markup, patch: newPatch, displayVoices: displayVoices });
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
  handleJackClick = jack => {
    this.setState({ jackClickedInfo: jack, jackClickedInfoOpen: true });
  };
  handleJackClickedInfoClose = () => {
    this.setState({ jackClickedInfoOpen: false });
  };
  handleSelectedVoiceModulesOnlyChange = e => {
    this.setState({ selectedVoiceModulesOnly: e.target.checked });
  };
  render() {
    const { classes } = this.props;

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
              selectedVoiceModulesOnly={this.state.selectedVoiceModulesOnly}
              onSelectedVoiceModulesOnlyChange={this.handleSelectedVoiceModulesOnlyChange}
            />
            <Rack
              patch={this.state.patch}
              moduleDb={moduleDB}
              moduleHeight={this.state.moduleHeight}
              spacing={0}
              rackWidth={this.state.rackContainerWidth}
              displayVoices={this.state.displayVoices}
              onJackClick={this.handleJackClick}
              selectedVoiceModulesOnly={this.state.selectedVoiceModulesOnly}
            />
          </Grid>
        </Grid>

        <Snackbar
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={this.state.jackClickedInfoOpen}
          onClose={this.handleJackClickedInfoClose}
          message={
            <span id="app__info-text">
              <Typography className={`${classes.jackClickInfoTypography} ${classes.jackClickInfo_Module}`} variant="subheading">
                {this.state.jackClickedInfo.module}
              </Typography>
              <Typography className={`${classes.jackClickInfoTypography} ${classes.jackClickInfo_Jack}`} variant="title">
                {this.state.jackClickedInfo.jack}
              </Typography>
              <Typography className={`${classes.jackClickInfoTypography} ${classes.jackClickInfo_Type}`} variant="subheading">
                ({this.state.jackClickedInfo.type})
              </Typography>
            </span>
          }
        />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
