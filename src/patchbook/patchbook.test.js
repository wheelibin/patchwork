/* globals describe test expect*/

import * as patchbook from "./patchbook";

function BasicTestCase(value, expected) {
  this.value = value;
  this.expected = expected;
}

function ConnectionTestCase(value, outModule, outName, connectionType, inModule, inName) {
  this.value = value;
  this.outModule = outModule;
  this.outName = outName;
  this.connectionType = connectionType;
  this.inModule = inModule;
  this.inName = inName;
}

describe("Parse", () => {
  describe("Voices", () => {
    test("Extracts voices", () => {
      const testCases = [
        new BasicTestCase("VOICE 1:", "VOICE 1"),
        new BasicTestCase("VOICE2:", "VOICE2"),
        new BasicTestCase("VOICE-3:", "VOICE-3"),
        new BasicTestCase("VOICE-4 A LOVELY VOICE:", "VOICE-4 A LOVELY VOICE"),
        new BasicTestCase("     VOICE5:", "VOICE5"),
        new BasicTestCase("VOICE6", undefined),
        new BasicTestCase(":VOICE7", undefined)
      ];

      testCases.forEach(tc => {
        const parsed = patchbook.parse(tc.value);
        if (!tc.expected) {
          expect(parsed.voices[0]).toBe(undefined);
        } else {
          expect(parsed.voices[0].name).toBe(tc.expected);
        }

        if (tc.expectedCount) {
          expect(parsed.voices.length).toBe(tc.expectedCount);
        }
      });
    });

    test("Extracts multiple voices", () => {
      const pb = `// dum tss dum tss
                  VOICE1:
                    - ADE-32 (OUT:1) t> BIA (Trigger)
                  // acid bass
                  VOICE2:
                    - ADE-32 (OUT:2) p> Mother-32 (VCO 1V/OCT)`;
      const parsed = patchbook.parse(pb);
      expect(parsed.voices.length).toBe(2);
      expect(parsed.voices[0].name).toBe("VOICE1");
      expect(parsed.voices[1].name).toBe("VOICE2");
    });
  });
  describe("Connections", () => {
    test("Extracts connections for voice", () => {
      const testCases = [
        new ConnectionTestCase("VOICE1:\n - ADE-32 (OUT:2) p> Mother-32 (VCO 1V/OCT)", "ADE-32", "OUT:2", "Pitch", "Mother-32", "VCO 1V/OCT"),
        new ConnectionTestCase("VOICE1:\n - Maths (Ch2) >> Maths (Ch4 FALL)", "Maths", "Ch2", "CV", "Maths", "Ch4 FALL"),
        new ConnectionTestCase("VOICE1:\n - mod1 (out) p> mod2 (in)", "mod1", "out", "Pitch", "mod2", "in"),
        new ConnectionTestCase("VOICE1:\n - mod1   (out)   p>    mod2      (in)", "mod1", "out", "Pitch", "mod2", "in")
      ];

      testCases.forEach(tc => {
        const parsed = patchbook.parse(tc.value);
        expect(parsed.voices.length).toBe(1);

        const voice = parsed.voices[0];
        expect(voice.connections.length).toBe(1);

        const conn = voice.connections[0];
        expect(conn.outModule).toBe(tc.outModule);
        expect(conn.outName).toBe(tc.outName);
        expect(conn.connectionType).toBe(tc.connectionType);
        expect(conn.inModule).toBe(tc.inModule);
        expect(conn.inName).toBe(tc.inName);
      });
    });
  });
  describe("Patch", () => {
    test("Extracts multiple voices and the connections for those voices", () => {
      const pb = `// Bangin' techno shit
                  DRUMS:
                    - ADE-32 (OUT:1) t> BIA (Trigger)
                    - ADE-32 (OUT:3) >> Maths (Ch3)

                  // Gnarly acid bass
                  VOICE 1:
                    - ADE-32 (OUT:2) p> Mother-32 (VCO 1V/OCT)
                    - ADE-32 (OUT:4) t> Maths (Ch4 TRIG)
                    - ADE-32 (OUT:7) >> Mother-32 (VCF CUTOFF)`;
      const parsed = patchbook.parse(pb);

      expect(parsed.voices.length).toBe(2);
      expect(parsed.voices[0].connections.length).toBe(2);
      expect(parsed.voices[1].connections.length).toBe(3);
    });

    test("Extracts module list for voice", () => {
      const pb = `// Gnarly acid bass
                  VOICE 1:
                    - ADE-32 (OUT:2) p> Mother-32 (VCO 1V/OCT)
                    - ADE-32 (OUT:4) t> Maths (Ch4 TRIG)
                    - ADE-32 (OUT:7) >> Mother-32 (VCF CUTOFF)`;
      const parsed = patchbook.parse(pb);

      expect(parsed.voices.length).toBe(1);
      const voice = parsed.voices[0];
      expect(voice.modules.length).toBe(3);

      expect(Object.keys(parsed.modules).length).toBe(3);
    });

    test("Extracts module list for multiple voices", () => {
      const pb = `// Gnarly acid bass
                  VOICE 1:
                    - ADE-32 (OUT:2) p> Mother-32 (VCO 1V/OCT)
                    - ADE-32 (OUT:4) t> Maths (Ch4 TRIG)
                    - ADE-32 (OUT:7) >> Mother-32 (VCF CUTOFF)
                  DRUMS:
                    - ADE-32 (OUT:1) t> BIA (Trigger)
                    - ADE-32 (OUT:3) >> Maths (Ch3)
                    - ADE-32 (OUT:5) >> Maths (Ch2)  `;
      const parsed = patchbook.parse(pb);

      expect(parsed.voices.length).toBe(2);
      const voice1 = parsed.voices[0];
      expect(voice1.modules.length).toBe(3);

      const voice2 = parsed.voices[1];
      expect(voice2.modules.length).toBe(3);

      expect(Object.keys(parsed.modules).length).toBe(4);
    });
  });
  describe("Parameters", () => {
    test("Extracts single line parameters for module", () => {
      const pb = "* Disting: Program = B4 | ClockSpeed = 1/4";
      const parsed = patchbook.parse(pb);
      expect(Object.keys(parsed.modules).length).toBe(1);
      const moduleParams = parsed.modules["Disting"];
      expect(moduleParams.length).toBe(2);
      expect(moduleParams[0].parameter).toBe("Program");
      expect(moduleParams[0].value).toBe("B4");
      expect(moduleParams[1].parameter).toBe("ClockSpeed");
      expect(moduleParams[1].value).toBe("1/4");
    });

    test("Extracts single line parameters for multiple modules", () => {
      const pb = `* Disting: Program = B4 | ClockSpeed = 1/4
                  * Mother-32: Pulse Width = 1 | VCO Mod Amount = 2.1`;
      const parsed = patchbook.parse(pb);
      expect(Object.keys(parsed.modules).length).toBe(2);

      const module1Params = parsed.modules["Disting"];
      expect(module1Params.length).toBe(2);
      expect(module1Params[0].parameter).toBe("Program");
      expect(module1Params[0].value).toBe("B4");

      const module2Params = parsed.modules["Mother-32"];
      expect(module2Params.length).toBe(2);
      expect(module2Params[0].parameter).toBe("Pulse Width");
      expect(module2Params[0].value).toBe("1");
    });

    test("Extracts multi line parameters for module", () => {
      const pb = ` * Mother-32:
                    | Pulse Width = 1
                    | VCO Mod Amount = 2.1
                    | Cutoff = 4`;
      const parsed = patchbook.parse(pb);
      expect(Object.keys(parsed.modules).length).toBe(1);

      const params = parsed.modules["Mother-32"];
      expect(params.length).toBe(3);
    });

    test("Extracts multi line parameters for multiple modules", () => {
      const pb = ` * Mother-32:
                    | Pulse Width = 1
                    | VCO Mod Amount = 2.1
                    | Cutoff = 4
                   * Quad VCA:
                    | Ch2 CV = 100%
                    | Ch2 Boost = Off
                    | Ch2 Response = 60%
                    | Ch2 Level = 0`;
      const parsed = patchbook.parse(pb);
      expect(Object.keys(parsed.modules).length).toBe(2);

      const params1 = parsed.modules["Mother-32"];
      expect(params1.length).toBe(3);

      const params2 = parsed.modules["Quad VCA"];
      expect(params2.length).toBe(4);
    });
  });

  test("Whole file", () => {
    const pb = `// Bangin' techno shit
                DRUMS: 
                  - ADE-32 (OUT:1) t> BIA (Trigger)
                  - ADE-32 (OUT:3) >> Maths (Ch3)
                  - ADE-32 (OUT:5) >> Maths (Ch2)  
                  - ADE-32 (OUT:6) t> Maths (Ch1 TRIG)
                  - Maths (Ch1 Unity) >> Quad VCA (CV 2)
                  - Maths (Ch2) >> BIA (Harmonics)
                  - Maths (Ch3) >> BIA (Attack)  
                  - Mother-32 (NOISE) -> Quad VCA (IN 2)
                  
                // Gnarly acid bass
                VOICE 1:	
                  - ADE-32 (OUT:2) p> Mother-32 (VCO 1V/OCT)  
                  - ADE-32 (OUT:4) t> Maths (Ch4 TRIG)  
                  - ADE-32 (OUT:7) >> Mother-32 (VCF CUTOFF)
                  - Maths (Ch2) >> Maths (Ch4 FALL)
                  - Maths (Ch2) >> Mother-32 (VCF RES)
                  - Maths (Ch4 Unity) >> LXd (CV)
                  - Disting (A) -> Quad VCA (IN 3)
                  - LXd (OUT 1) -> Disting (X)  
                  - Mother-32 (VCO PULSE) -> LXd (IN 1)
                  - Mother-32 (VCA) -> AUDIO INTERFACE (Ch1)
                  - Quad VCA (OUT 4) -> AUDIO INTERFACE (Ch2)
                
                  * ADE-32:
                  | Ch1 Type = PULSE
                  | Ch1 Div = 1
                  | Ch1 Offset = 0
                  | Ch1 Option = false	
                  | Ch2 Type = ARPS
                  | Ch2 Div = 1
                  | Ch2 Offset = 1/4
                  | Ch2 Loop/Arp = 3  
                  | Ch3 Type = LFO RMP
                  | Ch3 Div = 2
                  | Ch3 Offset = 1/4
                  | Ch4 Type = LOOPS
                  | Ch4 Div = 1
                  | Ch4 Offset = 1/4
                  | Ch4 Loop/Arp = 2
                  | Ch5 Type = LFO RMP
                  | Ch5 Div = 16
                  | Ch5 Offset = 0
                  | Ch6 Type = PULSE
                  | Ch6 Div = 2
                  | Ch6 Offset = 0
                  | Ch7 Type = LFO TRI
                  | Ch7 Div = 2
                  | Ch7 Offset = 0
                
                  * Maths:
                  | Ch1 Rise = 0
                  | Ch1 Fall = 72%
                  | Ch1 Response = EXP
                  | Ch2 = 1pm
                  | Ch3 = 1pm
                  | Ch4 Rise = 0
                  | Ch4 Fall = 76%
                  | Ch4 Response = EXP
                
                  * BIA:
                  | Pitch = 25%
                  | Spread = 0
                  | Harmonics = 0
                  | Morph = 0
                  | Fold = 0
                  | Attack = 25%
                  | Decay = 25%
                  | SLM = Liquid
                  | BAT = Alto
                
                  * Disting: Program = B4 | ClockSpeed = 1/4
                  
                  * Mother-32:
                  | Pulse Width = 1
                  | VCO Mod Amount = 2.1
                  | Cutoff = 4
                
                  * Quad VCA:
                  | Ch2 CV = 100%
                  | Ch2 Boost = Off
                  | Ch2 Response = 60%
                  | Ch2 Level = 0
                  | Ch3 CV = 0
                  | Ch3 Boost = Off
                  | Ch3 Level = 75%
                  | Ch4 CV = 0
                  | Ch4 Boost = Off
                  | Ch4 Level = 100% `;

    const parsed = patchbook.parse(pb);

    // Expected number of voices and modules
    expect(Object.keys(parsed.modules).length).toBe(8);
    expect(parsed.voices.length).toBe(2);

    // Expected number of connections
    expect(parsed.voices[0].connections.length).toBe(8);
    expect(parsed.voices[1].connections.length).toBe(11);

    // Expected number of params for each module
    expect(parsed.modules["ADE-32"].length).toBe(24);
    expect(parsed.modules["Maths"].length).toBe(8);
    expect(parsed.modules["BIA"].length).toBe(9);
    expect(parsed.modules["Disting"].length).toBe(2);
    expect(parsed.modules["Mother-32"].length).toBe(3);
    expect(parsed.modules["Quad VCA"].length).toBe(10);
  });
});
