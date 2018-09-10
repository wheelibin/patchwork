export const patch1 = `
// ++++++ //
// VOICES //
// ++++++ //

// Bangin' techno shit
DRUMS: 
  - ADE-32 (OUT:1) t> BIA (Trig)
  - ADE-32 (OUT:3) >> Maths (Ch3 IN)
  - ADE-32 (OUT:5) >> Maths (Ch2 IN)  
  - ADE-32 (OUT:6) t> Maths (Ch1 TRIG)
  - Maths (Ch1 Unity) >> Quad VCA (CV 2)
  - Maths (Ch2) >> BIA (Harm)
  - Maths (Ch3) >> BIA (Attack)  
  - Mother-32 (NOISE) -> Quad VCA (IN 2)

// Gnarly acid bass
VOICE 1:	
  - ADE-32 (OUT:2) p> Mother-32 (VCO 1V/OCT)  
  - ADE-32 (OUT:4) t> Maths (Ch4 TRIG)  
  - ADE-32 (OUT:7) >> Mother-32 (VCF CUTOFF)
  - Maths (Ch2) >> Maths (Ch4 FALL)
  - Maths (Ch2) >> Mother-32 (VCF RES.)
  - Maths (Ch4 Unity) >> LXd (12db CV)
  - Disting-Mk4 (A) -> Quad VCA (IN 3)
  - LXd (12db Out) -> Disting-Mk4 (X)  
  - Mother-32 (VCO PULSE) -> LXd (12db In)
  - Mother-32 (VCA) -> AUDIO INTERFACE (Ch1)
  - Quad VCA (OUT 4) -> AUDIO INTERFACE (Ch2)


// +++++++++++++++++ //
// MODULE PARAMETERS //
// +++++++++++++++++ //
* Mother-32:
  // Patchwork RACK_ROW option
  | RACK_ROW = 1 
  | Pulse Width = 1
  | VCO Mod Amount = 2.1
  | Cutoff = 4

* ADE-32:
  | RACK_ROW = 2
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
  | RACK_ROW = 2
  | Ch1 Rise = 0
  | Ch1 Fall = 72%
  | Ch1 Response = EXP
  | Ch2 = 1pm
  | Ch3 = 1pm
  | Ch4 Rise = 0
  | Ch4 Fall = 76%
  | Ch4 Response = EXP
  
* BIA: 
  | RACK_ROW = 2
  | Pitch = 25%
  | Spread = 0
  | Harmonics = 0
  | Morph = 0
  | Fold = 0
  | Attack = 25%
  | Decay = 25%
  | SLM = Liquid
  | BAT = Alto
  
* Disting-Mk4: RACK_ROW = 2 | Program = B4 | ClockSpeed = 1/4  

* LXd: RACK_ROW = 2

* Quad VCA:
  | RACK_ROW = 2
  | Ch2 CV = 100%
  | Ch2 Boost = Off
  | Ch2 Response = 60%
  | Ch2 Level = 0
  | Ch3 CV = 0
  | Ch3 Boost = Off
  | Ch3 Level = 75%
  | Ch4 CV = 0
  | Ch4 Boost = Off
  | Ch4 Level = 100%
`;

export const mathsBouncingBall = `
BouncingBall:
  	- A Clock Source (CLOCK OUT) -> Maths (Ch1 TRIG)
	- Maths (Ch1) -> Maths (Ch4 BOTH) 
	- Maths (Ch1 EOR) -> Maths (Ch4 CYCLE)
	- Maths (Ch4) -> VCA or LPG (CV IN)`;
