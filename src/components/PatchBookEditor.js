/* globals require */
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import CodeMirror from "codemirror";
import PatchBookMode from "../patchbook/patchbookCodeMirrorMode";
import "./PatchBookEditor.css";

require("codemirror/lib/codemirror.css");
require("codemirror/theme/monokai.css");
require("codemirror/addon/mode/simple");

const styles = theme => ({
  textField: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit
  }
});

class PatchBookEditor extends PureComponent {
  constructor() {
    super();
    this.textAreaRef = React.createRef();
    this.state = { codeMirrorCreated: false };
    this.codeMirror = null;
  }
  // componentWillReceiveProps(nextProps) {
  //   if (this.props.markup !== nextProps.markup) {
  //     this.codeMirror.setValue(nextProps.markup);
  //   }
  // }
  setTextAreaRef = element => {
    if (!this.state.codeMirrorCreated) {
      CodeMirror.defineSimpleMode("patchbook", PatchBookMode);
      this.codeMirror = CodeMirror.fromTextArea(element, {
        mode: "patchbook",
        tabSize: 2,
        theme: "monokai"
      });
      const { onMarkupChanged } = this.props;
      this.codeMirror.on("changes", () => {
        onMarkupChanged(this.codeMirror.getValue());
      });

      this.setState({ codeMirrorCreated: true });
    }
  };
  render() {
    const { markup, classes } = this.props;
    if (!this.state.codeMirrorCreated) {
      return <textarea className={classes.textField} defaultValue={markup} ref={this.setTextAreaRef} />;
    }
    return null;
  }
}

PatchBookEditor.propTypes = {
  markup: PropTypes.string,
  onMarkupChanged: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PatchBookEditor);
