/* globals setTimeout clearTimeout document */
import React, { Component } from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Error";

import { homepage } from "../../package.json";
import "./Patchwork.css";
import Rack from "./Rack";
import PatchBookEditor from "./PatchBookEditor";
import RackToolbar from "./RackToolbar";
import Loading from "./Loading";
import moduleDB from "../modules.json";
import * as patchworkApi from "../patchworkApi";
import ShareDialog from "./ShareDialog";

import * as patches from "../patches";
import * as patchbook from "../patchbook/patchbook";
import { Typography } from "@material-ui/core";
import Alert from "./Alert";

let jackHighlightTimeout;

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
  },
  rackContainer: {
    paddingTop: 20
  },
  editorContainer: {
    height: "100vh",
    backgroundColor: "#272822"
  },
  alertErrorText: {
    color: theme.palette.grey[50],
    display: "inline-block",
    verticalAlign: "top",
    marginLeft: 16,
    marginTop: 3
  },
  alertErrorIcon: {
    color: theme.palette.secondary.light,
    marginTop: 2
  }
});

class Patchwork extends Component {
  constructor() {
    super();
    this.state = {
      markup: null,
      patch: {},
      rackContainerWidth: 0,
      moduleHeight: 300,
      displayVoices: [],
      jackClickedInfo: "",
      selectedVoiceModulesOnly: false,
      shareDialogOpen: false,
      shareUrl: "",
      alertOpen: false,
      alertShowDuration: 2000,
      alertContent: null
    };
    this.shareDialogInputRef = React.createRef();
  }
  async componentDidMount() {
    const { match } = this.props;
    this.setState({ loading: true });

    const patchId = match.params.patchid;
    let patchMarkup = patches.patch1;
    let fetchedMarkup;
    if (patchId) {
      try {
        fetchedMarkup = await patchworkApi.getPatch(patchId);
        if (!fetchedMarkup) {
          this.showError("Requested patch not found", 5000);
        }
      } catch (error) {
        this.showError("Error retrieving saved patch, the server may be down", 5000);
      }

      patchMarkup = fetchedMarkup || patchMarkup;
    }

    const patch = patchMarkup && patchMarkup.length ? patchbook.parse(patchMarkup) : "";
    const displayVoices = patch.voices ? patch.voices.map(v => v.name) : [];
    this.setState({ markup: patchMarkup, patch: patch, displayVoices: displayVoices, loading: false });
  }
  showError = (alert, showDuration) => {
    const { classes } = this.props;
    this.setState({
      alertOpen: true,
      alertShowDuration: showDuration,
      alertContent: (
        <span>
          <ErrorIcon className={classes.alertErrorIcon} />
          <Typography variant="subheading" className={classes.alertErrorText}>
            {alert}
          </Typography>
        </span>
      )
    });
  };
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

    this.setState({ patch: newPatch, displayVoices: displayVoices, markup: markup });
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
    const { classes } = this.props;

    this.setState({ jackClickedInfo: jack }, () => {
      const jackInfo = (
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
      );
      this.setState({ alertContent: jackInfo, alertOpen: true, highlightJack: jack });
      clearTimeout(jackHighlightTimeout);
      jackHighlightTimeout = setTimeout(() => {
        this.setState({ highlightJack: null });
      }, this.state.alertShowDuration);
    });
  };
  handleAlertClose = () => {
    this.setState({ alertOpen: false });
  };
  handleSelectedVoiceModulesOnlyChange = e => {
    this.setState({ selectedVoiceModulesOnly: e.target.checked });
  };
  handleShare = async () => {
    try {
      const savedPatch = await patchworkApi.savePatch(this.state.markup);
      const patch = JSON.parse(savedPatch);
      this.setState({ shareDialogOpen: true, shareUrl: `${homepage}/${patch._id}` });
    } catch (error) {
      this.showError("Error saving patch, the server may be down", 5000);
    }
  };
  handleShareDialogClose = () => {
    this.setState({ shareDialogOpen: false });
  };
  handleShareDialogCopy = () => {
    this.shareDialogInputRef.current.select();
    document.execCommand("copy");
  };
  render() {
    const { classes } = this.props;

    if (this.state.loading) {
      return <Loading show={this.state.loading} />;
    } else {
      return (
        <div className={classes.app}>
          <Grid container spacing={24}>
            <Grid item xs={12} sm={4}>
              <div className={classes.editorContainer}>
                {this.state.markup != null && <PatchBookEditor markup={this.state.markup} onMarkupChanged={this.handleMarkupChanged} />}
              </div>
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
                onShare={this.handleShare}
              />
              <div className={classes.rackContainer}>
                <Rack
                  patch={this.state.patch}
                  moduleDb={moduleDB}
                  moduleHeight={this.state.moduleHeight}
                  spacing={0}
                  rackWidth={this.state.rackContainerWidth}
                  displayVoices={this.state.displayVoices}
                  onJackClick={this.handleJackClick}
                  selectedVoiceModulesOnly={this.state.selectedVoiceModulesOnly}
                  highlightJack={this.state.highlightJack}
                />
              </div>
            </Grid>
          </Grid>

          <Alert
            open={this.state.alertOpen}
            onClose={this.handleAlertClose}
            hideAfter={this.state.alertShowDuration}
            content={this.state.alertContent}
          />

          <ShareDialog
            url={this.state.shareUrl}
            open={this.state.shareDialogOpen}
            onClose={this.handleShareDialogClose}
            onCopy={this.handleShareDialogCopy}
            inputRef={this.shareDialogInputRef}
          />
        </div>
      );
    }
  }
}

Patchwork.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default withStyles(styles)(Patchwork);
