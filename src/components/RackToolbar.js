import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";

import "rc-slider/assets/index.css";
import Slider from "rc-slider/lib/Slider";
import { Typography } from "@material-ui/core";

let secondaryColour = "";
const styles = theme => {
  secondaryColour = theme.palette.secondary.main;
  return {
    app: {
      overflowX: "hidden",
      overflowY: "hidden"
    },
    appBar: {
      marginLeft: -16,
      width: "calc(100% + 16px)",
      backgroundColor: "white"
    },
    sliderContainer: {
      width: 160,
      position: "absolute",
      right: 24
    },
    slider: {
      width: 100,
      display: "inline-block",
      margin: "0 7px -3px 4px"
    },
    zoomIcons: {
      verticalAlign: "middle"
    },
    voicesForm: {
      marginLeft: 16
    }
  };
};

const RackToolbar = ({ classes, zoomLevel, onZoom, patch, onVoiceToggle, displayVoices }) => {
  return (
    <AppBar position="static" color="default" className={classes.appBar}>
      <Toolbar>
        <Typography variant="title">Voices:</Typography>
        <FormGroup row className={classes.voicesForm}>
          {patch.voices &&
            patch.voices.map((voice, index) => {
              return (
                <FormControlLabel
                  key={index}
                  onChange={onVoiceToggle}
                  control={<Checkbox checked={!!displayVoices.find(v => v === voice.name)} value={voice.name} />}
                  label={voice.name}
                />
              );
            })}
        </FormGroup>
        <div className={classes.sliderContainer}>
          <ZoomOutIcon className={classes.zoomIcons} color="secondary" />
          <Slider
            handleStyle={{ borderColor: secondaryColour }}
            trackStyle={{ backgroundColor: secondaryColour }}
            className={classes.slider}
            value={zoomLevel}
            min={100}
            max={600}
            onChange={onZoom}
          />
          <ZoomInIcon className={classes.zoomIcons} color="secondary" />
        </div>
      </Toolbar>
    </AppBar>
  );
};

RackToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  zoomLevel: PropTypes.number.isRequired,
  onZoom: PropTypes.func.isRequired,
  onVoiceToggle: PropTypes.func.isRequired,
  patch: PropTypes.object.isRequired,
  displayVoices: PropTypes.array.isRequired
};

export default withStyles(styles)(RackToolbar);
