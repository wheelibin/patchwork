/* globals window Image */

import React, { Component } from "react";
import PropTypes from "prop-types";

class Rack extends Component {
  constructor() {
    super();
    this.canvasRef = React.createRef();
    this.moduleDb = [];
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
  Init() {
    this.imagesLoaded = 0;
    this.moduleDb = this.props.modules;
    this.patch = this.props.patch;
    this.moduleHeight = this.props.moduleHeight;

    this.canvas.width = this.props.rackWidth;
    this.canvas.height = this.getMaxRow() * this.moduleHeight + this.moduleHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    // upscale the canvas content
    this.canvas.width = this.canvas.width * this.devicePixelRatio;
    this.canvas.height = this.canvas.height * this.devicePixelRatio;
    // downscale the presentation
    this.canvas.style.width = (this.canvas.width / this.devicePixelRatio).toString() + "px";
    this.canvas.style.height = (this.canvas.height / this.devicePixelRatio).toString() + "px";

    this.canvasContext = this.canvas.getContext("2d");
    //this.canvasContext.imageSmoothingQuality = "high";

    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.modulesToDisplay = [];

    this.config = {
      jackIndicatorRadius: this.devicePixelRatio * (this.moduleHeight / 40),
      cableWidth: this.devicePixelRatio * (this.moduleHeight / 50),
      cableSagMin: 150,
      cableSagMax: this.moduleHeight + this.moduleHeight / 3,
      inputJackColours: {
        fill: "rgba(178, 242, 0, 0.3)",
        border: "rgba(178, 242, 0, 0.5)"
      },
      outputJackColours: {
        fill: "rgba(255, 124, 0, 0.3)",
        border: "rgba(255, 124, 0, 0.3)"
      }
    };

    this.loadAllImages();
  }
  getConnectionColour = (type, alpha) => {
    const connectionColours = {
      CV: `rgba(255, 244, 0, ${alpha})`,
      Audio: `rgba(0, 165, 147, ${alpha})`,
      Pitch: `rgba(197, 0, 137, ${alpha})`,
      Gate: `rgba(178, 242, 0, ${alpha})`,
      Trigger: `rgba(0, 133, 164, ${alpha})`,
      Clock: `rgba(243, 0, 33, ${alpha})`
    };
    return connectionColours[type];
  };
  loadAllImages = () => {
    const totalPossibleModules = Object.keys(this.patch.modules).length;

    Object.keys(this.patch.modules).forEach(moduleName => {
      let moduleDef = this.moduleDb.find(m => m.name === moduleName);

      if (!moduleDef) {
        // Module in patch, but not in db
        moduleDef = this.createMockupModule(moduleName);
      }

      moduleDef.ActualImage = new Image();
      moduleDef.ActualImage.onload = () => {
        this.imagesLoaded += 1;
        if (this.imagesLoaded === totalPossibleModules) {
          this.allImagesLoaded();
        }
      };
      moduleDef.ActualImage.src = moduleDef.image;

      this.modulesToDisplay.push(moduleDef);
    });
  };
  createMockupModule = moduleName => {
    const inputs = {};
    const outputs = {};

    let inputCoords = {
      x: 120,
      y: 200
    };
    let outputCoords = {
      x: 475,
      y: 200
    };

    this.patch.voices.forEach(v => {
      v.connections.forEach(conn => {
        if (conn.inModule === moduleName) {
          inputs[conn.inName] = {
            x: inputCoords.x,
            y: inputCoords.y
          };
          inputCoords.y += 120;
        }

        if (conn.outModule === moduleName) {
          outputs[conn.outName] = {
            x: outputCoords.x,
            y: outputCoords.y
          };
          outputCoords.y += 120;
        }
      });
    });

    return { id: "BLANK-10HP", name: moduleName, image: "images/blank_14hp.jpg", inputs: inputs, outputs: outputs, isMockup: true };
  };
  allImagesLoaded = () => {
    //let totalModuleWidth = 0;
    // this.moduleDb.filter(m => m.ActualImage).forEach(m => {
    //   const adjustmentRatio = this.moduleHeight / m.ActualImage.height;
    //   totalModuleWidth += m.ActualImage.width * adjustmentRatio;
    // });

    const moduleRows = {};
    Object.keys(this.patch.modules).forEach(moduleName => {
      const rowParam = this.patch.modules[moduleName].find(p => p.parameter === "RACK_ROW");
      const row = rowParam ? rowParam.value : 1;
      moduleRows[moduleName] = row - 1;
    });

    let xOffsets = {}; // (this.canvas.width - totalModuleWidth) / 2;
    this.modulesToDisplay.forEach(moduleDef => {
      const row = moduleRows[moduleDef.name];
      if (!xOffsets[row]) {
        xOffsets[row] = 0;
      }

      moduleDef.offset = {
        x: xOffsets[row] ? xOffsets[row] : 0,
        y: row * this.moduleHeight
      };

      moduleDef.sizeAdjustmentRatio = this.moduleHeight / moduleDef.ActualImage.height;
      const adjustedImageWidth = moduleDef.ActualImage.width * moduleDef.sizeAdjustmentRatio;

      this.drawModule(moduleDef);
      xOffsets[row] += adjustedImageWidth + this.props.spacing || 0;
    });

    this.patch.voices.forEach(v => {
      v.connections.forEach(conn => {
        const mOut = this.modulesToDisplay.find(m => m.name === conn.outModule);
        const mIn = this.modulesToDisplay.find(m => m.name === conn.inModule);

        if (mOut && mIn) {
          let output = mOut.outputs[conn.outName];
          let input = mIn.inputs[conn.inName];

          this.drawConnection(this.canvasContext, output, input, mOut, mIn, conn.connectionType);
        }
      });
    });
  };
  drawModule = moduleDef => {
    const ctx = this.canvasContext;

    ctx.drawImage(
      moduleDef.ActualImage,
      this.devicePixelRatio * moduleDef.offset.x,
      this.devicePixelRatio * moduleDef.offset.y,
      this.devicePixelRatio * moduleDef.ActualImage.width * moduleDef.sizeAdjustmentRatio,
      this.devicePixelRatio * this.props.moduleHeight
    );

    Object.keys(moduleDef.inputs).forEach(input => {
      const inputCoords = {
        x: this.devicePixelRatio * (moduleDef.offset.x + moduleDef.inputs[input].x * moduleDef.sizeAdjustmentRatio),
        y: this.devicePixelRatio * (moduleDef.offset.y + moduleDef.inputs[input].y * moduleDef.sizeAdjustmentRatio)
      };
      this.drawJackIndicator(ctx, inputCoords.x, inputCoords.y, this.config.inputJackColours.fill, this.config.inputJackColours.border);
      if (moduleDef.isMockup) {
        const fontSize = 12 * this.devicePixelRatio;
        ctx.font = `${fontSize}px Roboto`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(input, inputCoords.x, inputCoords.y - 30);
      }
    });
    Object.keys(moduleDef.outputs).forEach(output => {
      const outputCoords = {
        x: this.devicePixelRatio * (moduleDef.offset.x + moduleDef.outputs[output].x * moduleDef.sizeAdjustmentRatio),
        y: this.devicePixelRatio * (moduleDef.offset.y + moduleDef.outputs[output].y * moduleDef.sizeAdjustmentRatio)
      };
      this.drawJackIndicator(ctx, outputCoords.x, outputCoords.y, this.config.outputJackColours.fill, this.config.outputJackColours.border);
      if (moduleDef.isMockup) {
        const fontSize = 12 * this.devicePixelRatio;
        ctx.font = `${fontSize}px Roboto`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(output, outputCoords.x, outputCoords.y - 30);
      }
    });

    if (moduleDef.isMockup) {
      this.drawModuleName(ctx, moduleDef);
    }
  };
  drawModuleName = (ctx, moduleDef) => {
    ctx.save();
    const mockupTextPos = {
      x: 296,
      y: 100
    };
    const fontSize = 18 * this.devicePixelRatio;
    ctx.font = `${fontSize}px Roboto`;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    // ctx.translate(
    //   this.devicePixelRatio * (moduleDef.offset.x + mockupTextPos.x * moduleDef.sizeAdjustmentRatio),
    //   this.devicePixelRatio * (moduleDef.offset.y + mockupTextPos.y * moduleDef.sizeAdjustmentRatio)
    // );
    // ctx.rotate(-Math.PI / 2);
    // ctx.textAlign = "center";
    // ctx.fillText(moduleDef.name.toUpperCase(), -200, -65);
    // ctx.restore();

    ctx.fillText(
      moduleDef.name.toUpperCase(),
      this.devicePixelRatio * (moduleDef.offset.x + mockupTextPos.x * moduleDef.sizeAdjustmentRatio),
      this.devicePixelRatio * (moduleDef.offset.y + mockupTextPos.y * moduleDef.sizeAdjustmentRatio)
    );
  };
  drawJackIndicator = (ctx, x, y, fillColour, lineColour) => {
    ctx.beginPath();
    ctx.arc(x, y, this.config.jackIndicatorRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = fillColour;
    ctx.fill();
    ctx.lineWidth = 3 * this.devicePixelRatio;
    ctx.strokeStyle = lineColour;
    ctx.stroke();
  };
  drawConnection = (ctx, output, input, outModule, inModule, type) => {
    const jackFrom = {
      x: output ? this.devicePixelRatio * (output.x * outModule.sizeAdjustmentRatio + outModule.offset.x) : 0,
      y: output ? this.devicePixelRatio * (output.y * outModule.sizeAdjustmentRatio + outModule.offset.y) : 0
    };
    const jackTo = {
      x: input ? this.devicePixelRatio * (input.x * inModule.sizeAdjustmentRatio + inModule.offset.x) : 0,
      y: input ? this.devicePixelRatio * (input.y * inModule.sizeAdjustmentRatio + inModule.offset.y) : 0
    };
    const connectionColour = this.getConnectionColour(type, 0.75);

    ctx.beginPath();
    ctx.moveTo(jackFrom.x, jackFrom.y);

    ctx.quadraticCurveTo(
      jackFrom.x + (jackTo.x - jackFrom.x) / 2,
      jackFrom.y + (jackTo.y - jackFrom.y) / 2 + this.getRandomCableSag(),
      jackTo.x,
      jackTo.y
    );
    ctx.lineWidth = this.config.cableWidth;
    ctx.strokeStyle = connectionColour;
    ctx.stroke();

    this.drawJackIndicator(ctx, jackFrom.x, jackFrom.y, connectionColour, this.config.outputJackColours.border);
    this.drawJackIndicator(ctx, jackTo.x, jackTo.y, connectionColour, this.config.inputJackColours.border);
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
  getMaxRow = () => {
    let maxRow = 0;
    Object.keys(this.patch.modules).forEach(moduleName => {
      const rowParam = this.patch.modules[moduleName].find(p => p.parameter === "RACK_ROW");
      const row = rowParam ? rowParam.value : 1;
      if (row > maxRow) {
        maxRow = row;
      }
    });
    return maxRow;
  };
  getRandomCableSag = () => {
    return Math.floor(Math.random() * (this.config.cableSagMax - this.config.cableSagMin + 1) + this.config.cableSagMin);
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
  modules: PropTypes.array.isRequired,
  moduleHeight: PropTypes.number.isRequired,
  spacing: PropTypes.number,
  patch: PropTypes.object.isRequired,
  rackWidth: PropTypes.number.isRequired
};

export default Rack;
