import React from "react";
import { Snackbar } from "@material-ui/core";

const Alert = ({ hideAfter, open, onClose, content }) => {
  return (
    <Snackbar autoHideDuration={hideAfter} anchorOrigin={{ vertical: "top", horizontal: "right" }} open={open} onClose={onClose} message={content} />
  );
};

export default Alert;
