import React from "react";
import PropTypes from "prop-types";
import { CircularProgress, Typography, withStyles } from "@material-ui/core";

const styles = {
  loading: {
    height: "100vh",
    backgroundImage: "url(images/loading-background.jpg)",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundSize: 900,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  progress: {
    verticalAlign: "middle"
  },
  text: {
    display: "inline-block",
    marginLeft: 16
  },
  info: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 4,
    //marginTop: 190,
    boxShadow: "0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)"
  }
};

const Loading = ({ show, classes }) => {
  if (show) {
    return (
      <div className={classes.loading}>
        <div className={classes.info}>
          <CircularProgress color="secondary" className={classes.progress} />
          <Typography variant="subheading" className={classes.text}>
            Loading patch...
          </Typography>
        </div>
      </div>
    );
  }

  return null;
};

Loading.propTypes = {
  show: PropTypes.bool,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Loading);
