import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  DialogTitle,
  TextField,
  InputAdornment,
  IconButton
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import CopyIcon from "@material-ui/icons/FileCopy";

const styles = theme => ({
  dialog: {
    width: 420
  },
  url: {
    color: theme.palette.secondary.main
  }
});

const ShareDialog = ({ url, open, onClose, classes, onCopy, inputRef }) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">Share your patch</DialogTitle>
      <DialogContent className={classes.dialog}>
        <DialogContentText id="alert-dialog-description" />
        <TextField
          className={classes.url}
          inputRef={inputRef}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="Copy to clipboard" onClick={onCopy}>
                  <CopyIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          defaultValue={url}
          fullWidth
          readOnly
          margin="normal"
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ShareDialog.propTypes = {
  open: PropTypes.bool,
  url: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  onCopy: PropTypes.func.isRequired,
  inputRef: PropTypes.object.isRequired
};

export default withStyles(styles)(ShareDialog);
