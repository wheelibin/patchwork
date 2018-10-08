import React from "react";
import PropTypes from "prop-types";
import { Snackbar } from "@material-ui/core";

const Alert = ({ hideAfter, open, onClose, content }) => {
  return (
    <Snackbar autoHideDuration={hideAfter} anchorOrigin={{ vertical: "top", horizontal: "right" }} open={open} onClose={onClose} message={content} />
  );
};

Alert.propTypes = {
  hideAfter: PropTypes.number.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired
};

export default Alert;
