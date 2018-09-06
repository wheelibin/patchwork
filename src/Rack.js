/* globals window Image */

import React, { Component } from "react";
import PropTypes from "prop-types";

class Rack extends Component {
  constructor() {
    super();
    this.canvasRef = React.createRef();
    this.imagesLoaded = 0;
    this.state = {
      modules: []
    };
  }
  componentDidMount() {
    this.config = {
      jackIndicatorRadius: this.props.moduleHeight / 40,
      connectionColour: "rgba(195, 0, 136, 0.3)",
      connectedJackColour: "rgba(195, 0, 136, 1)",
      cableSagMin: 50,
      cableSagMax: this.props.moduleHeight + this.props.moduleHeight / 2
    };

    this.canvas = this.canvasRef.current;
    this.canvas.width = window.innerWidth;
    this.canvas.height = this.props.moduleHeight * 2;
    this.canvasContext = this.canvas.getContext("2d");

    this.setState({ modules: this.props.modules });

    this.props.modules.forEach(moduleDef => {
      moduleDef.ActualImage = new Image();
      moduleDef.ActualImage.onload = () => {
        this.setState({
          modules: this.state.modules.map(m => (m.id === moduleDef.id ? Object.assign({}, m, { moduleDef }) : m))
        });
        this.imagesLoaded += 1;
        if (this.imagesLoaded === this.props.modules.length) {
          this.allImagesLoaded();
        }
      };
      moduleDef.ActualImage.src = moduleDef.image;
    });
  }
  allImagesLoaded = () => {
    let totalModuleWidth = 0;
    this.state.modules.forEach(m => {
      const adjustmentRatio = this.props.moduleHeight / m.ActualImage.height;
      totalModuleWidth += m.ActualImage.width * adjustmentRatio;
    });

    let xOffset = (this.canvas.width - totalModuleWidth) / 2;
    let yOffset = 0;
    this.state.modules.forEach(moduleDef => {
      moduleDef.offset = {
        x: xOffset,
        y: yOffset
      };

      moduleDef.sizeAdjustmentRatio = this.props.moduleHeight / moduleDef.ActualImage.height;
      const adjustedImageWidth = moduleDef.ActualImage.width * moduleDef.sizeAdjustmentRatio;

      this.drawModule(moduleDef);
      xOffset += adjustedImageWidth + this.props.spacing || 0;

      this.setState({
        modules: this.state.modules.map(m => (m.id === moduleDef.id ? Object.assign({}, m, { moduleDef }) : m))
      });
    });

    const m1 = this.state.modules.find(m => m.id === "ABSTRACT_DATA:ADE-32");
    const m2 = this.state.modules.find(m => m.id === "uO_C");

    let output = m1.outputs[Object.keys(m1.outputs)[0]];
    let input = m2.inputs[Object.keys(m2.inputs)[0]];
    this.drawConnection(this.canvasContext, output, input, m1, m2);

    output = m1.outputs[Object.keys(m1.outputs)[1]];
    input = m2.inputs[Object.keys(m2.inputs)[1]];
    this.drawConnection(this.canvasContext, output, input, m1, m2);
  };
  drawModule = moduleDef => {
    const ctx = this.canvasContext;

    ctx.drawImage(
      moduleDef.ActualImage,
      moduleDef.offset.x,
      0,
      moduleDef.ActualImage.width * moduleDef.sizeAdjustmentRatio,
      this.props.moduleHeight
    );

    Object.keys(moduleDef.inputs).forEach(input => {
      this.drawJackIndicator(
        ctx,
        moduleDef.offset.x + moduleDef.inputs[input].x * moduleDef.sizeAdjustmentRatio,
        moduleDef.inputs[input].y * moduleDef.sizeAdjustmentRatio,
        "rgba(178, 242, 0, 0.7)",
        "rgba(178, 242, 0, 1)"
      );
    });
    Object.keys(moduleDef.outputs).forEach(output => {
      this.drawJackIndicator(
        ctx,
        moduleDef.offset.x + moduleDef.outputs[output].x * moduleDef.sizeAdjustmentRatio,
        moduleDef.outputs[output].y * moduleDef.sizeAdjustmentRatio,
        "rgba(255, 124, 0, 0.7)",
        "rgba(255, 124, 0, 1)"
      );
    });
  };
  drawJackIndicator = (ctx, x, y, fillColour, lineColour) => {
    ctx.beginPath();
    ctx.arc(x, y, this.config.jackIndicatorRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = fillColour;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = lineColour;
    ctx.stroke();
  };
  drawConnection = (ctx, output, input, outModule, inModule) => {
    const jackFrom = {
      x: output.x * outModule.sizeAdjustmentRatio + outModule.offset.x,
      y: output.y * outModule.sizeAdjustmentRatio
    };
    const jackTo = {
      x: input.x * inModule.sizeAdjustmentRatio + inModule.offset.x,
      y: input.y * inModule.sizeAdjustmentRatio
    };
    ctx.beginPath();
    ctx.moveTo(jackFrom.x, jackFrom.y);
    ctx.quadraticCurveTo(
      jackFrom.x + (jackTo.x - jackFrom.x) / 2,
      jackFrom.y + (jackTo.y - jackFrom.y) + this.getRandomCableSag(),
      jackTo.x,
      jackTo.y
    );
    ctx.lineWidth = 10;
    // line color
    ctx.strokeStyle = this.config.connectionColour;
    ctx.stroke();

    this.drawJackIndicator(
      ctx,
      jackFrom.x,
      jackFrom.y,
      this.config.connectedJackColour,
      this.config.connectedJackColour
    );
    this.drawJackIndicator(ctx, jackTo.x, jackTo.y, this.config.connectedJackColour, this.config.connectedJackColour);
  };
  handleCanvasClick = e => {
    const rect = this.canvas.getBoundingClientRect();
    const clickPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    let hit = false;

    this.state.modules.forEach(moduleDef => {
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
  getRandomCableSag = () => {
    return Math.floor(
      Math.random() * (this.config.cableSagMax - this.config.cableSagMin + 1) + this.config.cableSagMin
    );
  };
  isIntersect = (point, inout, moduleDef) => {
    const inoutX = inout.x * moduleDef.sizeAdjustmentRatio;

    return (
      Math.sqrt(
        (point.x - (inoutX + moduleDef.offset.x)) ** 2 + (point.y - inout.y * moduleDef.sizeAdjustmentRatio) ** 2
      ) < this.config.jackIndicatorRadius
    );
  };
  render() {
    return <canvas ref={this.canvasRef} height={this.props.moduleHeight} onClick={this.handleCanvasClick} />;
  }
}

Rack.propTypes = {
  modules: PropTypes.array.isRequired,
  moduleHeight: PropTypes.number.isRequired,
  spacing: PropTypes.number
};

export default Rack;
