/* globals window document Image */

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import * as rackFunctions from "../utils/rackFunctions";

class Rack extends PureComponent {
  constructor() {
    super();
    this.canvasRef = React.createRef();
    this.rackRef = React.createRef();
    this.patch = {};
    this.moduleHeight = 0;
  }
  componentDidMount() {
    this.canvas = document.createElement("canvas");
    this.canvas.onclick = this.handleCanvasClick;
    this.canvasContext = this.canvas.getContext("2d");
    this.rackRef.current.appendChild(this.canvas);
    this.Init();
  }
  componentDidUpdate() {
    this.Init();
  }
  Init() {
    const { moduleDb, patch, moduleHeight, spacing, displayVoices, selectedVoiceModulesOnly } = this.props;

    const devicePixelRatio = window.devicePixelRatio;
    this.modulesToDisplay = [];

    this.config = {
      devicePixelRatio: devicePixelRatio,
      moduleHeight: moduleHeight,
      spacing: spacing,
      paddingTop: 0,
      jackIndicatorRadius: (moduleHeight / 40) * devicePixelRatio,
      cableWidth: (moduleHeight / 50) * devicePixelRatio,
      // cableSagMin: 150,
      // cableSagMax: moduleHeight + moduleHeight / 3,
      cableSagMin: moduleHeight,
      cableSagMax: moduleHeight,
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
      },
      displayVoices: displayVoices,
      selectedVoiceModulesOnly: selectedVoiceModulesOnly
    };

    this.renderRack(patch, moduleDb, moduleHeight, devicePixelRatio);
  }

  clearCanvas = () => {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  renderRack = (patch, moduleDb, moduleHeight, devicePixelRatio) => {
    if (!patch.modules || !Object.keys(patch.modules).length) {
      // No patch, so clear canvas and return
      this.clearCanvas();
      return;
    }

    window.requestAnimationFrame(() => {
      let totalModulesInPatch = 0;
      let imagesLoaded = 0;

      Object.keys(patch.modules).forEach(moduleName => {
        if (this.config.selectedVoiceModulesOnly && !this.moduleInDisplayVoices(patch, moduleName)) {
          return;
        }

        let moduleDef = moduleDb.find(m => m.name === moduleName);

        if (!moduleDef) {
          // Module in patch, but not in db, so create mockup
          moduleDef = rackFunctions.createMockupModule(patch, moduleName);
        }

        moduleDef.ActualImage = new Image();
        moduleDef.ActualImage.onload = () => {
          imagesLoaded += 1;
          if (imagesLoaded === totalModulesInPatch) {
            this.InitCanvas(patch, moduleHeight, devicePixelRatio);
            rackFunctions.drawRack(patch, this.modulesToDisplay, this.canvasContext, this.config);
            //rackFunctions.cropCanvas(this.canvasContext, this.canvas);
          }
        };
        moduleDef.ActualImage.src = moduleDef.image;

        this.modulesToDisplay.push(moduleDef);
        totalModulesInPatch += 1;
      });

      if (totalModulesInPatch === 0) {
        this.clearCanvas();
      }
    });
  };

  InitCanvas(patch, moduleHeight, devicePixelRatio) {
    // Calculate the max width of all rows
    let maxRowWidth = 0;
    let rowWidths = {};
    Object.keys(patch.modules).forEach(moduleName => {
      const rowParam = patch.modules[moduleName].find(p => p.parameter === "RACK_ROW");
      const row = rowParam ? rowParam.value : 1;
      if (!rowWidths[row]) {
        rowWidths[row] = 0;
      }
      const m = this.modulesToDisplay.find(m => m.name === moduleName);
      const adjustmentRatio = moduleHeight / m.ActualImage.height;
      rowWidths[row] += this.modulesToDisplay.find(m => m.name === moduleName).ActualImage.width * adjustmentRatio;
      maxRowWidth = Math.max(maxRowWidth, rowWidths[row]);
    });

    this.canvas.width = maxRowWidth;
    this.canvas.height = this.getMaxRow(patch) * moduleHeight + moduleHeight / 4;

    // upscale the canvas content
    this.canvas.width = this.canvas.width * devicePixelRatio;
    this.canvas.height = this.canvas.height * devicePixelRatio;
    // downscale the presentation
    this.canvas.style.width = (this.canvas.width / devicePixelRatio).toString() + "px";
    this.canvas.style.height = (this.canvas.height / devicePixelRatio).toString() + "px";
  }

  moduleInDisplayVoices = (patch, moduleName) => {
    // Get a list of modules in the display voices
    const modulesInDisplayVoices = [];
    this.config.displayVoices.forEach(dv => {
      const voices = patch.voices.filter(v => v.name === dv);
      voices.forEach(voice => {
        voice.modules.forEach(m => {
          modulesInDisplayVoices.push(m);
        });
      });
    });

    return modulesInDisplayVoices.find(v => v === moduleName);
  };
  handleCanvasClick = e => {
    const { onJackClick } = this.props;
    const rect = this.canvas.getBoundingClientRect();
    const clickPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    let jackHit = null;

    this.modulesToDisplay.forEach(moduleDef => {
      Object.keys(moduleDef.inputs).forEach(input => {
        if (this.isIntersect(clickPos, moduleDef.inputs[input], moduleDef)) {
          jackHit = { module: moduleDef.name, type: "IN", jack: input };
        }
      });
      if (!jackHit) {
        Object.keys(moduleDef.outputs).forEach(output => {
          if (this.isIntersect(clickPos, moduleDef.outputs[output], moduleDef)) {
            jackHit = { module: moduleDef.name, type: "OUT", jack: output };
          }
        });
      }
    });

    if (jackHit && onJackClick) {
      onJackClick(jackHit);
    }
  };

  isIntersect = (point, jack, moduleDef) => {
    if (!moduleDef.offset) {
      return false;
    }

    const jackPosition = {
      x: jack.x * moduleDef.sizeAdjustmentRatio,
      y: jack.y * moduleDef.sizeAdjustmentRatio
    };

    return (
      Math.sqrt((point.x - (jackPosition.x + moduleDef.offset.x)) ** 2 + (point.y - (jackPosition.y + moduleDef.offset.y)) ** 2) <
      this.config.jackIndicatorRadius
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
    return <div ref={this.rackRef} />;
  }
}

Rack.propTypes = {
  moduleDb: PropTypes.array.isRequired,
  moduleHeight: PropTypes.number.isRequired,
  spacing: PropTypes.number,
  patch: PropTypes.object.isRequired,
  displayVoices: PropTypes.array.isRequired,
  onJackClick: PropTypes.func,
  selectedVoiceModulesOnly: PropTypes.bool
};

export default Rack;
