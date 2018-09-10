/* globals window Image */

import React, { Component } from "react";
import PropTypes from "prop-types";
import * as rackFunctions from "../utils/rackFunctions";

class Rack extends Component {
  constructor() {
    super();
    this.canvasRef = React.createRef();
    this.patch = {};
    this.moduleHeight = 0;
  }
  componentDidMount() {
    this.canvas = this.canvasRef.current;
    this.Init();
  }
  componentDidUpdate(prevProps) {
    if (this.props.patch !== prevProps.patch) {
      this.Init();
    }
  }
  InitCanvas(patch, rackWidth, moduleHeight, devicePixelRatio) {
    this.canvas.width = rackWidth;
    this.canvas.height = this.getMaxRow(patch) * moduleHeight + moduleHeight;

    // upscale the canvas content
    this.canvas.width = this.canvas.width * devicePixelRatio;
    this.canvas.height = this.canvas.height * devicePixelRatio;
    // downscale the presentation
    this.canvas.style.width = (this.canvas.width / devicePixelRatio).toString() + "px";
    this.canvas.style.height = (this.canvas.height / devicePixelRatio).toString() + "px";

    this.canvasContext = this.canvas.getContext("2d");
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  Init() {
    const { moduleDb, patch, moduleHeight, rackWidth, spacing } = this.props;

    const devicePixelRatio = window.devicePixelRatio;

    this.modulesToDisplay = [];

    this.config = {
      devicePixelRatio: devicePixelRatio,
      moduleHeight: moduleHeight,
      spacing: spacing,
      paddingTop: 10 * devicePixelRatio,
      jackIndicatorRadius: (moduleHeight / 40) * devicePixelRatio,
      cableWidth: (moduleHeight / 50) * devicePixelRatio,
      cableSagMin: 150,
      cableSagMax: moduleHeight + moduleHeight / 3,
      inputJackColours: {
        fill: "rgba(178, 242, 0, 0.3)",
        border: "rgba(178, 242, 0, 0.5)"
      },
      outputJackColours: {
        fill: "rgba(255, 124, 0, 0.3)",
        border: "rgba(255, 124, 0, 0.3)"
      },
      getConnectionColour: (type, alpha) => {
        const connectionColours = {
          CV: `rgba(255, 244, 0, ${alpha})`,
          Audio: `rgba(0, 165, 147, ${alpha})`,
          Pitch: `rgba(197, 0, 137, ${alpha})`,
          Gate: `rgba(178, 242, 0, ${alpha})`,
          Trigger: `rgba(0, 133, 164, ${alpha})`,
          Clock: `rgba(243, 0, 33, ${alpha})`
        };
        return connectionColours[type];
      }
    };

    this.InitCanvas(patch, rackWidth, moduleHeight, devicePixelRatio);
    this.renderRack(patch, moduleDb);
  }
  renderRack = (patch, moduleDb) => {
    const totalModulesInPatch = Object.keys(patch.modules).length;
    let imagesLoaded = 0;
    Object.keys(patch.modules).forEach(moduleName => {
      let moduleDef = moduleDb.find(m => m.name === moduleName);

      if (!moduleDef) {
        // Module in patch, but not in db, so create mockup
        moduleDef = rackFunctions.createMockupModule(patch, moduleName);
      }

      moduleDef.ActualImage = new Image();
      moduleDef.ActualImage.onload = () => {
        imagesLoaded += 1;
        if (imagesLoaded === totalModulesInPatch) {
          rackFunctions.drawRack(patch, this.modulesToDisplay, this.canvasContext, this.config);
        }
      };
      moduleDef.ActualImage.src = moduleDef.image;

      this.modulesToDisplay.push(moduleDef);
    });
  };

  handleCanvasClick = e => {
    const rect = this.canvas.getBoundingClientRect();
    const clickPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    let hit = false;

    this.modulesToDisplay.forEach(moduleDef => {
      Object.keys(moduleDef.inputs).forEach(input => {
        if (this.isIntersect(clickPos, moduleDef.inputs[input], moduleDef)) {
          console.log(`${moduleDef.name}::input::${input}`);
          hit = true;
        }
      });
      if (hit) {
        return;
      }
      Object.keys(moduleDef.outputs).forEach(output => {
        if (this.isIntersect(clickPos, moduleDef.outputs[output], moduleDef)) {
          console.log(`${moduleDef.name}::output::${output}`, clickPos, moduleDef);
          hit = true;
        }
      });
    });

    if (hit) {
      console.log("Do something");
    }
  };
  isIntersect = (point, inout, moduleDef) => {
    if (!moduleDef.offset) {
      return false;
    }

    const inoutX = inout.x * moduleDef.sizeAdjustmentRatio;
    const inoutY = inout.y * moduleDef.sizeAdjustmentRatio;

    return (
      Math.sqrt((point.x - (inoutX + moduleDef.offset.x)) ** 2 + (point.y - (inoutY + moduleDef.offset.y)) ** 2) < this.config.jackIndicatorRadius
    );
  };
  getMaxRow = patch => {
    let maxRow = 0;
    Object.keys(patch.modules).forEach(moduleName => {
      const rowParam = patch.modules[moduleName].find(p => p.parameter === "RACK_ROW");
      const row = rowParam ? rowParam.value : 1;
      if (row > maxRow) {
        maxRow = row;
      }
    });
    return maxRow;
  };

  render() {
    return (
      <div>
        <canvas ref={this.canvasRef} height={this.props.moduleHeight} onClick={this.handleCanvasClick} />
      </div>
    );
  }
}

Rack.propTypes = {
  moduleDb: PropTypes.array.isRequired,
  moduleHeight: PropTypes.number.isRequired,
  spacing: PropTypes.number,
  patch: PropTypes.object.isRequired,
  rackWidth: PropTypes.number.isRequired
};

export default Rack;
