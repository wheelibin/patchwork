import React, { Component } from "react";
import modules from "./modules.json";

const jackIndicatorRadius = 10;

class Module extends Component {
  constructor() {
    super();
    this.state = {
      canvasWidth: 0,
      canvasHeight: 0
    };
    this.canvasRef = React.createRef();
  }
  componentDidMount() {
    this.module = modules[this.props.name];

    this.canvas = this.canvasRef.current;
    this.canvasContext = this.canvas.getContext("2d");
    this.sourceImage = new Image();
    this.sourceImage.onload = () => {
      this.sizeAdjustmentRatio = this.props.height / this.sourceImage.height;
      this.setState(
        {
          canvasWidth: this.sourceImage.width * this.sizeAdjustmentRatio,
          canvasHeight: this.props.height
        },
        () => {
          this.drawModule();
        }
      );
    };
    this.sourceImage.src = this.module.image;
  }
  drawModule = () => {
    const ctx = this.canvasContext;
    ctx.drawImage(this.sourceImage, 0, 0, this.sourceImage.width * this.sizeAdjustmentRatio, this.props.height);
    Object.keys(this.module.inputs).forEach(input => {
      this.drawCircle(
        ctx,
        this.module.inputs[input].x * this.sizeAdjustmentRatio,
        this.module.inputs[input].y * this.sizeAdjustmentRatio,
        "rgba(178, 242, 0, 0.7)",
        "rgba(178, 242, 0, 1)"
      );
    });
    Object.keys(this.module.outputs).forEach(output => {
      this.drawCircle(
        ctx,
        this.module.outputs[output].x * this.sizeAdjustmentRatio,
        this.module.outputs[output].y * this.sizeAdjustmentRatio,
        "rgba(255, 127, 0, 0.7)",
        "rgba(255, 127, 0, 1)"
      );
    });
  };
  drawCircle = (ctx, x, y, fillColour, lineColour) => {
    ctx.beginPath();
    ctx.arc(x, y, jackIndicatorRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = fillColour;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = lineColour;
    ctx.stroke();
  };
  handleCanvasClick = e => {
    const rect = this.canvas.getBoundingClientRect();
    const clickPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    let hit = false;
    Object.keys(this.module.inputs).forEach(input => {
      if (this.isIntersect(clickPos, this.module.inputs[input])) {
        console.log(`${this.props.name}::input::${input}`);
        hit = true;
      }
    });
    if (hit) {
      return;
    }
    Object.keys(this.module.outputs).forEach(output => {
      if (this.isIntersect(clickPos, this.module.outputs[output])) {
        console.log(`${this.props.name}::output::${output}`);
        hit = true;
      }
    });

    if (hit) {
      console.log("Do something");
    }
  };
  isIntersect = (point, circle) => {
    return (
      Math.sqrt(
        (point.x - circle.x * this.sizeAdjustmentRatio) ** 2 + (point.y - circle.y * this.sizeAdjustmentRatio) ** 2
      ) < jackIndicatorRadius
    );
  };
  render() {
    return (
      <canvas
        ref={this.canvasRef}
        width={this.state.canvasWidth}
        height={this.state.canvasHeight}
        onClick={this.handleCanvasClick}
      />
    );
  }
}

export default Module;
