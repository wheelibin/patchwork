import React from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
  textField: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    fontFamily: "'Roboto Mono', monospace",
    fontSize: "0.7em"
  }
});

const PatchBookEditor = ({ markup, onMarkupChanged, classes }) => {
  return (
    <TextField
      InputProps={{
        classes: {
          input: classes.textField
        }
      }}
      label="Patchbook markup"
      placeholder=""
      fullWidth
      rows="50"
      multiline
      margin="normal"
      value={markup}
      onChange={e => onMarkupChanged(e.target.value)}
    />
  );
};

PatchBookEditor.propTypes = {
  markup: PropTypes.string,
  onMarkupChanged: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PatchBookEditor);
