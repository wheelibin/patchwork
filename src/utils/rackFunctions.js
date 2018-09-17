export const drawRack = (patch, modulesToDisplay, canvasContext, config) => {
  const moduleRows = {};
  Object.keys(patch.modules).forEach(moduleName => {
    const rowParam = patch.modules[moduleName].find(p => p.parameter === "RACK_ROW");
    const row = rowParam ? rowParam.value : 1;
    moduleRows[moduleName] = row - 1;
  });

  let xOffsets = {};
  modulesToDisplay.forEach(moduleDef => {
    const row = moduleRows[moduleDef.name];
    if (!xOffsets[row]) {
      xOffsets[row] = 0;
    }

    moduleDef.offset = {
      x: xOffsets[row] ? xOffsets[row] : 0,
      y: row * config.moduleHeight + config.paddingTop
    };

    moduleDef.sizeAdjustmentRatio = config.moduleHeight / moduleDef.ActualImage.height;
    const adjustedImageWidth = moduleDef.ActualImage.width * moduleDef.sizeAdjustmentRatio;

    drawModule(moduleDef, canvasContext, config);
    xOffsets[row] += adjustedImageWidth + config.spacing || 0;
  });

  patch.voices.forEach(v => {
    if (config.displayVoices.find(dv => dv === v.name)) {
      v.connections.forEach(conn => {
        const mOut = modulesToDisplay.find(m => m.name === conn.outModule);
        const mIn = modulesToDisplay.find(m => m.name === conn.inModule);

        if (mOut && mIn) {
          let output = mOut.outputs[conn.outName];
          let input = mIn.inputs[conn.inName];

          let highlightConnection = null;
          if (config.highlightJack) {
            highlightConnection =
              (conn.outModule === config.highlightJack.module && conn.outName === config.highlightJack.jack) ||
              (conn.inModule === config.highlightJack.module && conn.inName === config.highlightJack.jack);
          }

          drawConnection(canvasContext, output, input, mOut, mIn, conn.connectionType, config.devicePixelRatio, config, highlightConnection);
        }
      });
    }
  });
};

export const createMockupModule = (patch, moduleName) => {
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

  patch.voices.forEach(v => {
    v.connections.forEach(conn => {
      if (conn.inModule === moduleName && !inputs[conn.inName]) {
        inputs[conn.inName] = {
          x: inputCoords.x,
          y: inputCoords.y
        };
        inputCoords.y += 120;
      }

      if (conn.outModule === moduleName && !outputs[conn.outName]) {
        outputs[conn.outName] = {
          x: outputCoords.x,
          y: outputCoords.y
        };
        outputCoords.y += 120;
      }
    });
  });

  return { id: "BLANK", name: moduleName, image: "images/blank_14hp.jpg", inputs: inputs, outputs: outputs, isMockup: true };
};

export const cropCanvas = (ctx, canvas) => {
  var w = canvas.width,
    h = canvas.height,
    pix = { x: [], y: [] },
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
    x,
    y,
    index;

  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      index = (y * w + x) * 4;
      if (imageData.data[index + 3] > 0) {
        pix.x.push(x);
        pix.y.push(y);
      }
    }
  }
  pix.x.sort(function(a, b) {
    return a - b;
  });
  pix.y.sort(function(a, b) {
    return a - b;
  });
  var n = pix.x.length - 1;

  w = pix.x[n] - pix.x[0];
  h = pix.y[n] - pix.y[0];
  var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

  canvas.width = w;
  canvas.height = h;
  ctx.putImageData(cut, 0, 0);

  // // upscale the canvas content
  // canvas.width = canvas.width * window.devicePixelRatio;
  // canvas.height = canvas.height * window.devicePixelRatio;
  // // downscale the presentation
  canvas.style.width = (canvas.width / window.devicePixelRatio).toString() + "px";
  canvas.style.height = (canvas.height / window.devicePixelRatio).toString() + "px";
};

const drawJackIndicator = (ctx, x, y, fillColour, lineColour, devicePixelRatio, config) => {
  ctx.beginPath();
  ctx.arc(x, y, config.jackIndicatorRadius, 0, 2 * Math.PI, false);
  ctx.fillStyle = fillColour;
  ctx.fill();
  ctx.lineWidth = 3 * devicePixelRatio;
  ctx.strokeStyle = lineColour;
  ctx.stroke();
};

const drawModule = (moduleDef, canvasContext, config) => {
  const ctx = canvasContext;

  ctx.drawImage(
    moduleDef.ActualImage,
    config.devicePixelRatio * moduleDef.offset.x,
    config.devicePixelRatio * moduleDef.offset.y,
    config.devicePixelRatio * moduleDef.ActualImage.width * moduleDef.sizeAdjustmentRatio,
    config.devicePixelRatio * config.moduleHeight
  );
  const mockupModuleJackTextYOffset = (config.moduleHeight / 25) * config.devicePixelRatio;
  const mockupModuleJackTextFontSize = (config.moduleHeight / 36) * config.devicePixelRatio;

  Object.keys(moduleDef.inputs).forEach(input => {
    const inputCoords = {
      x: config.devicePixelRatio * (moduleDef.offset.x + moduleDef.inputs[input].x * moduleDef.sizeAdjustmentRatio),
      y: config.devicePixelRatio * (moduleDef.offset.y + moduleDef.inputs[input].y * moduleDef.sizeAdjustmentRatio)
    };
    drawJackIndicator(
      ctx,
      inputCoords.x,
      inputCoords.y,
      config.inputJackColours.fill,
      config.inputJackColours.border,
      config.devicePixelRatio,
      config
    );

    if (moduleDef.isMockup) {
      ctx.font = `${mockupModuleJackTextFontSize}px Roboto`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(input, inputCoords.x, inputCoords.y - mockupModuleJackTextYOffset);
    }
  });
  Object.keys(moduleDef.outputs).forEach(output => {
    const outputCoords = {
      x: config.devicePixelRatio * (moduleDef.offset.x + moduleDef.outputs[output].x * moduleDef.sizeAdjustmentRatio),
      y: config.devicePixelRatio * (moduleDef.offset.y + moduleDef.outputs[output].y * moduleDef.sizeAdjustmentRatio)
    };
    drawJackIndicator(
      ctx,
      outputCoords.x,
      outputCoords.y,
      config.outputJackColours.fill,
      config.outputJackColours.border,
      config.devicePixelRatio,
      config
    );
    if (moduleDef.isMockup) {
      ctx.font = `${mockupModuleJackTextFontSize}px Roboto`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(output, outputCoords.x, outputCoords.y - mockupModuleJackTextYOffset);
    }
  });

  if (moduleDef.isMockup) {
    drawModuleName(ctx, moduleDef, config.devicePixelRatio, config.moduleHeight);
  }
};

const drawConnection = (ctx, output, input, outModule, inModule, type, devicePixelRatio, config, highlightConnection) => {
  const jackFrom = {
    x: output ? devicePixelRatio * (output.x * outModule.sizeAdjustmentRatio + outModule.offset.x) : 0,
    y: output ? devicePixelRatio * (output.y * outModule.sizeAdjustmentRatio + outModule.offset.y) : 0
  };
  const jackTo = {
    x: input ? devicePixelRatio * (input.x * inModule.sizeAdjustmentRatio + inModule.offset.x) : 0,
    y: input ? devicePixelRatio * (input.y * inModule.sizeAdjustmentRatio + inModule.offset.y) : 0
  };

  let cableAlpha = 0.75;
  if (highlightConnection != null) {
    cableAlpha = highlightConnection ? 1 : 0.25;
  }

  const connectionColour = config.getConnectionColour(type, cableAlpha);

  ctx.beginPath();
  ctx.moveTo(jackFrom.x, jackFrom.y);

  const shortCableSag = 150;
  const cableSag = Math.abs(jackTo.y - jackFrom.y) < 50 ? shortCableSag : getRandomCableSag(config);

  ctx.quadraticCurveTo(jackFrom.x + (jackTo.x - jackFrom.x) / 2, jackFrom.y + (jackTo.y - jackFrom.y) / 2 + cableSag, jackTo.x, jackTo.y);
  ctx.lineWidth = config.cableWidth;
  ctx.strokeStyle = connectionColour;
  ctx.stroke();

  drawJackIndicator(ctx, jackFrom.x, jackFrom.y, connectionColour, config.outputJackColours.border, devicePixelRatio, config);
  drawJackIndicator(ctx, jackTo.x, jackTo.y, connectionColour, config.inputJackColours.border, devicePixelRatio, config);
};

const getRandomCableSag = config => {
  return Math.floor(Math.random() * (config.cableSagMax - config.cableSagMin + 1) + config.cableSagMin);
};

const drawModuleName = (ctx, moduleDef, devicePixelRatio, moduleHeight) => {
  ctx.save();
  const mockupTextPos = {
    x: 296,
    y: 100
  };
  const fontSize = (moduleHeight / 22) * devicePixelRatio;
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
    devicePixelRatio * (moduleDef.offset.x + mockupTextPos.x * moduleDef.sizeAdjustmentRatio),
    devicePixelRatio * (moduleDef.offset.y + mockupTextPos.y * moduleDef.sizeAdjustmentRatio)
  );
};
