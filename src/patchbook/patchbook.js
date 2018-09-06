const patterns = {
  voice: { pattern: /^\s*\b(.+):/g, groups: { voice: 1 } },
  connection: {
    pattern: /-\s?(.+?(?=\())\((.+?(?=\)))\)\s+(>>|->|[a-z]>)\s+(.+)\((.+?(?=\)))\)/,
    groups: { outModule: 1, outName: 2, connectionType: 3, inModule: 4, inName: 5 }
  },
  singleLineParam: { pattern: /\*\s+(.+(?=:)):\s+(.+)/, groups: { module: 1, params: 2 } },
  multiLineParamModuleName: { pattern: /\*\s+(.+(?=:)):\s*$/g, groups: { module: 1 } },
  multiLineParam: { pattern: /^\s+\|\s+(.+(?==))=\s+(.+)/, groups: { param: 1, value: 2 } },
  comment: { pattern: /^\/\/[\s?](.+)/ }
};

const connectionTypes = {
  ">>": "CV",
  "->": "Audio",
  "p>": "Pitch",
  "g>": "Gate",
  "t>": "Trigger",
  "c>": "Clock"
};

export const parse = pb => {
  // reset the regex positions
  Object.keys(patterns).forEach(p => {
    patterns[p].pattern.lastIndex = 0;
  });

  const voices = [];
  let modules = {};
  const multiLineParamModules = [];
  const lines = pb.split("\n");

  lines.forEach(line => {
    const voiceMatch = patterns.voice.pattern.exec(line);
    if (voiceMatch) {
      voices.push({
        name: voiceMatch[patterns.voice.groups.voice],
        connections: [],
        modules: []
      });
    }

    if (voices.length > 0) {
      const currentVoice = voices[voices.length - 1];

      const connectionMatch = patterns.connection.pattern.exec(line);

      if (connectionMatch) {
        const connectionTypeDesc = connectionTypes[connectionMatch[patterns.connection.groups.connectionType].trim()] || "Unknown";
        const outModule = connectionMatch[patterns.connection.groups.outModule].trim();
        const outName = connectionMatch[patterns.connection.groups.outName].trim();
        const connectionType = connectionTypeDesc;
        const inModule = connectionMatch[patterns.connection.groups.inModule].trim();
        const inName = connectionMatch[patterns.connection.groups.inName].trim();
        currentVoice.connections.push({
          outModule,
          outName,
          connectionType,
          inModule,
          inName
        });

        if (!currentVoice.modules.find(m => m === outModule)) {
          currentVoice.modules.push(outModule);
        }
        if (!currentVoice.modules.find(m => m === inModule)) {
          currentVoice.modules.push(inModule);
        }

        if (!modules[outModule]) {
          modules = { ...modules, [outModule]: [] };
        }
        if (!modules[inModule]) {
          modules = { ...modules, [inModule]: [] };
        }
      }
    }

    const singleLineParamMatch = patterns.singleLineParam.pattern.exec(line);
    if (singleLineParamMatch) {
      const module = singleLineParamMatch[patterns.singleLineParam.groups.module].trim();
      const rawParams = singleLineParamMatch[patterns.singleLineParam.groups.params].split("|");
      const params = rawParams.map(p => {
        const kv = p.split("=");
        return {
          parameter: kv[0].trim(),
          value: kv[1].trim()
        };
      });
      if (!modules[module]) {
        modules = { ...modules, [module]: [] };
      }
      modules[module] = params;
    }

    const multiLineParamModuleNameMatch = patterns.multiLineParamModuleName.pattern.exec(line);
    if (multiLineParamModuleNameMatch) {
      const module = multiLineParamModuleNameMatch[patterns.multiLineParamModuleName.groups.module].trim();
      multiLineParamModules.push(module);
      if (!modules[module]) {
        modules = { ...modules, [module]: [] };
      }
    }

    const multiLineParamMatch = patterns.multiLineParam.pattern.exec(line);
    if (multiLineParamMatch) {
      const param = multiLineParamMatch[patterns.multiLineParam.groups.param].trim();
      const value = multiLineParamMatch[patterns.multiLineParam.groups.value].trim();

      const multiLineParamModuleName = multiLineParamModules[multiLineParamModules.length - 1].trim();
      modules[multiLineParamModuleName].push({
        parameter: param,
        value: value
      });
    }
  });

  return {
    voices: voices,
    modules: modules
  };
};
