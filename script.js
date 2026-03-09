/* ═══════════════════════════════════════════════════════════
   ESCAPE ROOM — Horror Edition  (Multi-Theme Engine)
   Mansion · Asylum · Catacombs
   Sound, Drag, Badges, 3D, Story Mode, Dynamic Room Gen
   ═══════════════════════════════════════════════════════════ */

// ──────────── AUDIO ENGINE (Web Audio API) ────────────
const AudioEngine = {
  ctx: null,
  enabled: true,
  masterGain: null,
  ambientNodes: [],
  currentTheme: 'mansion',

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio not supported');
      this.enabled = false;
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  playTone(freq, duration, type = 'sine', volume = 0.3, detune = 0) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  /* ── Sound Presets ── */
  click()      { this.playTone(800, 0.08, 'square', 0.1); this.playTone(600, 0.05, 'sine', 0.05); },
  clueReveal() { this.playTone(400, 0.3, 'sine', 0.2); setTimeout(() => this.playTone(500, 0.3, 'sine', 0.15), 100); setTimeout(() => this.playTone(600, 0.4, 'sine', 0.1), 200); },
  correct()    { [523,659,784,1047].forEach((f,i) => setTimeout(() => this.playTone(f, 0.2, 'sine', 0.22), i*120)); },
  wrong()      { this.playTone(200, 0.3, 'sawtooth', 0.15); setTimeout(() => this.playTone(150, 0.4, 'sawtooth', 0.12), 150); },
  achievement(){ [523,659,784,1047,784,1047].forEach((f,i) => setTimeout(() => this.playTone(f, 0.2, 'sine', 0.2), i*100)); },
  heartbeat()  { this.playTone(50, 0.15, 'sine', 0.2); setTimeout(() => this.playTone(45, 0.12, 'sine', 0.15), 150); },
  whisper()    { for (let i = 0; i < 5; i++) this.playTone(200+Math.random()*800, 0.4, 'sine', 0.015, Math.random()*100-50); },

  notePlay(note) {
    const nf = {C:262,D:294,E:330,F:349,G:392,A:440,B:494};
    const f = nf[note]||440;
    this.playTone(f, 0.4, 'sine', 0.25); this.playTone(f*2, 0.3, 'sine', 0.08);
  },

  /* ── Theme-specific sounds ── */

  // MANSION — thunder & creaks
  horror_mansion() {
    this.playTone(40, 2, 'sawtooth', 0.08); this.playTone(42, 2, 'sawtooth', 0.06, 10);
    setTimeout(() => this.playTone(2000, 1.5, 'sine', 0.03, -20), 500);
  },
  doorCreak_mansion() {
    for (let i = 0; i < 8; i++) setTimeout(() => this.playTone(100+Math.random()*200, 0.15, 'sawtooth', 0.06), i*60);
  },
  thunder_mansion() {
    this.playTone(30, 1.5, 'sawtooth', 0.15); this.playTone(35, 1.2, 'square', 0.08);
    setTimeout(() => this.playTone(25, 1, 'sawtooth', 0.1), 200);
  },

  // ASYLUM — metallic clangs, fluorescent buzz, distant screams
  horror_asylum() {
    // Flickering fluorescent hum
    this.playTone(120, 1.5, 'square', 0.04); this.playTone(180, 1.2, 'square', 0.03, 5);
    // Distant high-pitched scream
    setTimeout(() => {
      this.playTone(1800, 0.6, 'sawtooth', 0.04, 30);
      this.playTone(2200, 0.4, 'sine', 0.02, -10);
    }, 800);
  },
  doorCreak_asylum() {
    // Metallic door slam
    this.playTone(90, 0.08, 'square', 0.15);
    setTimeout(() => this.playTone(60, 0.3, 'sawtooth', 0.1), 50);
    setTimeout(() => { for (let i=0;i<4;i++) setTimeout(()=>this.playTone(300+Math.random()*500,0.05,'square',0.04),i*30); }, 100);
  },
  thunder_asylum() {
    // Electrical surge / power flicker
    for (let i = 0; i < 6; i++) {
      setTimeout(() => this.playTone(80+Math.random()*100, 0.1, 'square', 0.08), i * 40);
    }
    setTimeout(() => this.playTone(60, 0.8, 'sawtooth', 0.06), 300);
  },

  // CATACOMBS — dripping water, deep rumbles, stone grinding
  horror_catacombs() {
    // Deep underground rumble
    this.playTone(25, 3, 'sine', 0.1); this.playTone(28, 2.5, 'sine', 0.07, 8);
    // Dripping echo
    setTimeout(() => {
      this.playTone(2400, 0.05, 'sine', 0.06);
      setTimeout(() => this.playTone(2200, 0.04, 'sine', 0.03), 200);
      setTimeout(() => this.playTone(2000, 0.03, 'sine', 0.015), 400);
    }, 600);
  },
  doorCreak_catacombs() {
    // Stone grinding
    for (let i = 0; i < 12; i++) {
      setTimeout(() => this.playTone(50+Math.random()*80, 0.12, 'sawtooth', 0.05+Math.random()*0.03), i*80);
    }
  },
  thunder_catacombs() {
    // Cave-in rumble
    this.playTone(20, 2, 'sawtooth', 0.12);
    this.playTone(35, 1.5, 'sine', 0.08);
    for (let i = 0; i < 5; i++) setTimeout(() => this.playTone(40+Math.random()*60, 0.2, 'square', 0.04), i*150);
  },

  // QUANTUM TIME LOOP — warped tones, time-stretch effects
  horror_quantum() { this.playTone(220,1.5,'sine',0.05,50); setTimeout(()=>this.playTone(440,1,'sine',0.04,-30),300); setTimeout(()=>this.playTone(110,2,'triangle',0.03),600); },
  doorCreak_quantum() { for(let i=0;i<6;i++) setTimeout(()=>this.playTone(800-i*100,0.1,'sine',0.04,i*20),i*70); },
  thunder_quantum() { this.playTone(60,1.5,'sine',0.1); this.playTone(120,1,'triangle',0.06,40); setTimeout(()=>this.playTone(240,0.8,'sine',0.04,-20),400); },

  // CYBERPUNK NEON DISTRICT — synth stabs, digital chirps
  horror_cyberpunk() { this.playTone(80,1,'square',0.04); this.playTone(160,0.8,'sawtooth',0.03,5); setTimeout(()=>{this.playTone(1200,0.05,'square',0.05);this.playTone(1600,0.04,'square',0.04);},500); },
  doorCreak_cyberpunk() { for(let i=0;i<5;i++) setTimeout(()=>this.playTone(1000+Math.random()*2000,0.03,'square',0.04),i*40); },
  thunder_cyberpunk() { for(let i=0;i<8;i++) setTimeout(()=>this.playTone(60+Math.random()*120,0.08,'square',0.06),i*30); setTimeout(()=>this.playTone(50,0.6,'sawtooth',0.08),300); },

  // UNDERWATER RESEARCH BASE — deep sonar pings, pressure groans
  horror_underwater() { this.playTone(30,3,'sine',0.08); this.playTone(33,2.5,'sine',0.06,6); setTimeout(()=>{this.playTone(1200,0.15,'sine',0.05);setTimeout(()=>this.playTone(1100,0.12,'sine',0.03),300);},800); },
  doorCreak_underwater() { this.playTone(200,0.5,'sine',0.06); setTimeout(()=>this.playTone(180,0.4,'sine',0.04),200); for(let i=0;i<3;i++) setTimeout(()=>this.playTone(2000+Math.random()*500,0.03,'sine',0.03),i*150+400); },
  thunder_underwater() { this.playTone(25,2,'sine',0.1); this.playTone(50,1.5,'sine',0.07); setTimeout(()=>this.playTone(800,0.08,'sine',0.05),500); },

  // HAUNTED VICTORIAN — creaky wood, wind, distant piano
  horror_victorian() { this.playTone(45,2,'sawtooth',0.06); this.playTone(47,1.8,'sawtooth',0.04,8); setTimeout(()=>{this.playTone(523,0.4,'sine',0.03);this.playTone(330,0.5,'sine',0.02);},700); },
  doorCreak_victorian() { for(let i=0;i<10;i++) setTimeout(()=>this.playTone(80+Math.random()*180,0.12,'sawtooth',0.05),i*50); },
  thunder_victorian() { this.playTone(35,1.5,'sawtooth',0.12); this.playTone(40,1.2,'square',0.06); setTimeout(()=>this.playTone(30,1,'sawtooth',0.08),250); },

  // SPACE STATION — alarms, mechanical hums, pressurization
  horror_spacestation() { this.playTone(100,2,'square',0.03); this.playTone(200,1.5,'square',0.02,3); setTimeout(()=>{this.playTone(800,0.3,'sine',0.04);setTimeout(()=>this.playTone(600,0.3,'sine',0.03),200);},600); },
  doorCreak_spacestation() { this.playTone(150,0.06,'square',0.1); setTimeout(()=>this.playTone(80,0.2,'sawtooth',0.06),50); for(let i=0;i<3;i++) setTimeout(()=>this.playTone(400+Math.random()*400,0.04,'square',0.03),100+i*30); },
  thunder_spacestation() { for(let i=0;i<10;i++) setTimeout(()=>this.playTone(60+Math.random()*80,0.08,'square',0.06),i*30); setTimeout(()=>this.playTone(40,1,'sawtooth',0.05),400); },

  // ANCIENT TEMPLE — deep gongs, chimes, stone echoes
  horror_temple() { this.playTone(65,3,'sine',0.07); this.playTone(130,2,'sine',0.04,4); setTimeout(()=>{this.playTone(1500,0.08,'sine',0.04);setTimeout(()=>this.playTone(1300,0.06,'sine',0.03),200);setTimeout(()=>this.playTone(1100,0.05,'sine',0.02),400);},500); },
  doorCreak_temple() { this.playTone(60,0.8,'sine',0.08); for(let i=0;i<6;i++) setTimeout(()=>this.playTone(55+Math.random()*30,0.15,'sawtooth',0.04),i*100); },
  thunder_temple() { this.playTone(50,2.5,'sine',0.1); this.playTone(100,2,'sine',0.06); setTimeout(()=>this.playTone(200,1,'triangle',0.04),300); },

  // DARK WEB HACKER VAULT — digital glitch, data corruption
  horror_hackervault() { for(let i=0;i<4;i++) this.playTone(800+Math.random()*3000,0.04,'square',0.02); setTimeout(()=>{this.playTone(100,0.5,'sawtooth',0.04);this.playTone(102,0.5,'sawtooth',0.03,3);},300); },
  doorCreak_hackervault() { for(let i=0;i<8;i++) setTimeout(()=>this.playTone(2000+Math.random()*4000,0.02,'square',0.03),i*25); },
  thunder_hackervault() { for(let i=0;i<12;i++) setTimeout(()=>this.playTone(50+Math.random()*150,0.06,'square',0.05),i*20); setTimeout(()=>this.playTone(80,0.8,'sawtooth',0.06),300); },

  // Dispatchers that use currentTheme
  horror()    { this[`horror_${this.currentTheme}`]?.() || this.horror_mansion(); },
  doorCreak() { this[`doorCreak_${this.currentTheme}`]?.() || this.doorCreak_mansion(); },
  thunder()   { this[`thunder_${this.currentTheme}`]?.() || this.thunder_mansion(); },

  /* ── Ambient drones per theme ── */
  startAmbient(theme) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    this.stopAmbient();
    this.currentTheme = theme || 'mansion';

    const profiles = {
      mansion:      { droneFreq: 55,  droneType: 'sine',     lfoFreq: 0.2,  lfoAmt: 5,  vol: 0.03  },
      asylum:       { droneFreq: 120, droneType: 'square',   lfoFreq: 8,    lfoAmt: 15, vol: 0.015 },
      catacombs:    { droneFreq: 35,  droneType: 'sine',     lfoFreq: 0.1,  lfoAmt: 3,  vol: 0.04  },
      quantum:      { droneFreq: 80,  droneType: 'sine',     lfoFreq: 0.5,  lfoAmt: 20, vol: 0.025 },
      cyberpunk:    { droneFreq: 90,  droneType: 'square',   lfoFreq: 4,    lfoAmt: 10, vol: 0.02  },
      underwater:   { droneFreq: 30,  droneType: 'sine',     lfoFreq: 0.08, lfoAmt: 2,  vol: 0.045 },
      victorian:    { droneFreq: 45,  droneType: 'sawtooth', lfoFreq: 0.15, lfoAmt: 4,  vol: 0.03  },
      spacestation: { droneFreq: 100, droneType: 'square',   lfoFreq: 2,    lfoAmt: 8,  vol: 0.018 },
      temple:       { droneFreq: 65,  droneType: 'sine',     lfoFreq: 0.12, lfoAmt: 3,  vol: 0.035 },
      hackervault:  { droneFreq: 110, droneType: 'square',   lfoFreq: 6,    lfoAmt: 12, vol: 0.015 }
    };
    const p = profiles[theme] || profiles.mansion;

    // Primary drone
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const drone = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    drone.type = p.droneType; drone.frequency.value = p.droneFreq; droneGain.gain.value = p.vol;
    lfo.type = 'sine'; lfo.frequency.value = p.lfoFreq; lfoGain.gain.value = p.lfoAmt;
    lfo.connect(lfoGain); lfoGain.connect(drone.frequency);
    drone.connect(droneGain); droneGain.connect(this.masterGain);
    lfo.start(); drone.start();
    this.ambientNodes.push(lfo, drone);

    // Secondary layer per theme
    if (theme === 'asylum') {
      // High fluorescent whine
      const whine = this.ctx.createOscillator();
      const wGain = this.ctx.createGain();
      whine.type = 'sine'; whine.frequency.value = 3800; wGain.gain.value = 0.005;
      whine.connect(wGain); wGain.connect(this.masterGain);
      whine.start(); this.ambientNodes.push(whine);
    } else if (theme === 'catacombs') {
      // Wind layer
      const wind = this.ctx.createOscillator();
      const wGain = this.ctx.createGain();
      const wLfo = this.ctx.createOscillator();
      const wLfoG = this.ctx.createGain();
      wind.type = 'sawtooth'; wind.frequency.value = 150; wGain.gain.value = 0.008;
      wLfo.type = 'sine'; wLfo.frequency.value = 0.3; wLfoG.gain.value = 80;
      wLfo.connect(wLfoG); wLfoG.connect(wind.frequency);
      wind.connect(wGain); wGain.connect(this.masterGain);
      wind.start(); wLfo.start();
      this.ambientNodes.push(wind, wLfo);
    } else if (theme === 'quantum') {
      // Phase-shifted dual oscillator for "unstable time" feel
      const osc2 = this.ctx.createOscillator(); const g2 = this.ctx.createGain();
      osc2.type = 'sine'; osc2.frequency.value = 82; g2.gain.value = 0.02;
      osc2.connect(g2); g2.connect(this.masterGain); osc2.start();
      this.ambientNodes.push(osc2);
    } else if (theme === 'cyberpunk') {
      // Pulsing bass + high chirps
      const sub = this.ctx.createOscillator(); const sg = this.ctx.createGain();
      sub.type = 'sawtooth'; sub.frequency.value = 45; sg.gain.value = 0.012;
      sub.connect(sg); sg.connect(this.masterGain); sub.start();
      this.ambientNodes.push(sub);
    } else if (theme === 'underwater') {
      // Deep pressure + bubble swell
      const deep = this.ctx.createOscillator(); const dg = this.ctx.createGain();
      const dLfo = this.ctx.createOscillator(); const dLg = this.ctx.createGain();
      deep.type = 'sine'; deep.frequency.value = 22; dg.gain.value = 0.03;
      dLfo.type = 'sine'; dLfo.frequency.value = 0.05; dLg.gain.value = 4;
      dLfo.connect(dLg); dLg.connect(deep.frequency);
      deep.connect(dg); dg.connect(this.masterGain); deep.start(); dLfo.start();
      this.ambientNodes.push(deep, dLfo);
    } else if (theme === 'victorian') {
      // Creaky-wind overlay
      const creak = this.ctx.createOscillator(); const cg = this.ctx.createGain();
      creak.type = 'sawtooth'; creak.frequency.value = 120; cg.gain.value = 0.006;
      const cl = this.ctx.createOscillator(); const clg = this.ctx.createGain();
      cl.type = 'sine'; cl.frequency.value = 0.25; clg.gain.value = 60;
      cl.connect(clg); clg.connect(creak.frequency);
      creak.connect(cg); cg.connect(this.masterGain); creak.start(); cl.start();
      this.ambientNodes.push(creak, cl);
    } else if (theme === 'spacestation') {
      // Mechanical hum + alarm undertone
      const mech = this.ctx.createOscillator(); const mg = this.ctx.createGain();
      mech.type = 'square'; mech.frequency.value = 200; mg.gain.value = 0.006;
      mech.connect(mg); mg.connect(this.masterGain); mech.start();
      this.ambientNodes.push(mech);
    } else if (theme === 'temple') {
      // Resonant harmonic overtone
      const gong = this.ctx.createOscillator(); const gg = this.ctx.createGain();
      gong.type = 'sine'; gong.frequency.value = 130; gg.gain.value = 0.015;
      gong.connect(gg); gg.connect(this.masterGain); gong.start();
      this.ambientNodes.push(gong);
    } else if (theme === 'hackervault') {
      // Digital warble
      const warp = this.ctx.createOscillator(); const wg = this.ctx.createGain();
      const wl = this.ctx.createOscillator(); const wlg = this.ctx.createGain();
      warp.type = 'square'; warp.frequency.value = 160; wg.gain.value = 0.005;
      wl.type = 'square'; wl.frequency.value = 12; wlg.gain.value = 30;
      wl.connect(wlg); wlg.connect(warp.frequency);
      warp.connect(wg); wg.connect(this.masterGain); warp.start(); wl.start();
      this.ambientNodes.push(warp, wl);
    }
  },

  stopAmbient() {
    this.ambientNodes.forEach(n => { try { n.stop(); } catch(e){} });
    this.ambientNodes = [];
  },

  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) this.masterGain.gain.value = this.enabled ? 0.3 : 0;
    return this.enabled;
  }
};

// ═══════════════════════════════════════════════════════════
//  THEME DATA — Puzzles, Stories & Config for all 10 themes
// ═══════════════════════════════════════════════════════════

const THEME_DATA = {

  // ────────── MANSION (5 rooms) ──────────
  mansion: {
    name: 'Haunted Mansion', icon: '🏚️', time: 600, hints: 3,
    bodyClass: 'theme-mansion',
    victoryMsg: (name) => `The manor releases you, ${name}... but it will never forget your name.`,
    defeatMsg:  (name) => `The mansion claimed another soul... ${name} was never seen again.`,
    puzzles: [
      {
        title: '🏚️ The Study', description: 'A dimly lit study. An old desk sits in the center with a locked drawer. Scratching sounds come from behind the portrait...',
        answer: '1742', inputLabel: 'Enter the 4-digit code to open the desk drawer:', inputMaxLength: 4, inputPlaceholder: '____', inputType: 'text',
        objects: [ {key:'portrait',icon:'🖼️',name:'Portrait'}, {key:'desk',icon:'🗄️',name:'Desk'}, {key:'book',icon:'📖',name:'Old Book'} ],
        clues: {
          portrait: '🖼️ The portrait frame has scratched numbers: "17__". The last two digits are hidden behind dried blood...',
          desk: '🗄️ Carved into the desk: "The year the city was founded minus the century you\'re in." — A note reads: "1842 - 100 = ?"',
          book: '📖 An open book reads: "The code is the year a great fire struck. Seventeen-forty-two." The page is stained with something dark...'
        },
        hint: 'Look at the old book — it mentions a specific year: 17_2',
        scoreValue: 1000, inventoryReward: '🗝️',
        roomTheme: { wallColor:'rgba(30,15,10,0.95)', lightColor:'rgba(255,152,0,0.08)' }
      },
      {
        title: '🧱 The Cipher Wall', description: 'Behind the desk, a hidden passage reveals itself. The walls are covered in strange symbols, and something dark drips from above...',
        answer: 'shadow', inputLabel: 'What word does the cipher spell? (lowercase)', inputMaxLength: 20, inputPlaceholder: 'Type answer...', inputType: 'text',
        objects: [ {key:'wall',icon:'🧱',name:'Wall Symbols'}, {key:'torch',icon:'🔦',name:'Flashlight'}, {key:'note',icon:'📝',name:'Torn Note'} ],
        clues: {
          wall: '🧱 Symbols on the wall: ▼♦■◆○● — Below: "Each shape is a letter. Count sides: 0=S, 4=H, 4=A, 4=D, 0=O, 0=W"',
          torch: '🔦 UV light reveals: "I follow you everywhere but vanish in darkness." The writing seems to move...',
          note: '📝 A blood-stained note: "_ H A D O _" — First letter = 19th letter. Last = 23rd.'
        },
        hint: 'What follows you everywhere but disappears in the dark? Think about light...',
        scoreValue: 1000, inventoryReward: '📜',
        roomTheme: { wallColor:'rgba(15,20,15,0.95)', lightColor:'rgba(0,255,65,0.05)' }
      },
      {
        title: '🎵 The Music Room', description: 'A room filled with dusty instruments. A haunted music box plays a broken melody on its own. Fix the notes before it drives you mad...',
        answer: 'EGBDF', inputLabel: 'Enter the note sequence (e.g., CDEFG):', inputMaxLength: 10, inputPlaceholder: '_ _ _ _ _', inputType: 'notes',
        objects: [ {key:'musicbox',icon:'🎵',name:'Music Box'}, {key:'piano',icon:'🎹',name:'Piano Keys'}, {key:'sheet',icon:'📜',name:'Sheet Music'} ],
        clues: {
          musicbox: '🎵 The music box has 5 slots. It plays a haunted melody: "Every Good Boy Does Fine"',
          piano: '🎹 E, G, B, D, F keys are worn and stained. They mark the treble clef lines.',
          sheet: '📜 Sheet music shows notes on 5 lines: E - G - B - D - F. A ghostly hand points to each...'
        },
        hint: '"Every Good Boy Does Fine" — what letters start each word?',
        scoreValue: 1000, inventoryReward: '🎵',
        roomTheme: { wallColor:'rgba(20,15,25,0.95)', lightColor:'rgba(123,31,162,0.06)' }
      },
      {
        title: '🪞 The Mirror Room', description: 'Infinite reflections stare back — but not all are yours. One mirror shows a different face. Find the pattern before the reflections come alive...',
        answer: '34', inputLabel: 'What is the missing number in the sequence?', inputMaxLength: 5, inputPlaceholder: '?', inputType: 'text',
        objects: [ {key:'mirror1',icon:'🪞',name:'Left Mirror'}, {key:'mirror2',icon:'🪞',name:'Center Mirror'}, {key:'mirror3',icon:'🪞',name:'Right Mirror'} ],
        clues: {
          mirror1: '🪞 Left mirror: 2, 3, 5, 8, 13, 21, ?, 55 — "Each number is the sum of the two before it."',
          mirror2: '🪞 Center mirror cracked. Behind: "Fibonacci knows the way. What comes after 21?" Your reflection grins...',
          mirror3: '🪞 Right mirror: "21 + ? = 55. But also, 13 + 21 = ?" The reflection doesn\'t match your movements.'
        },
        hint: 'Fibonacci sequence. Each number = sum of the two before it. 13 + 21 = ?',
        scoreValue: 1000, inventoryReward: '🪞',
        roomTheme: { wallColor:'rgba(15,15,25,0.95)', lightColor:'rgba(100,100,200,0.06)' }
      },
      {
        title: '🚪 The Final Door', description: 'The exit. But the door is sealed with ancient magic. A riddle is carved into the stone. Solve it, or become part of the mansion forever...',
        answer: 'key', inputLabel: 'Solve the riddle — what am I?', inputMaxLength: 20, inputPlaceholder: 'Type answer...', inputType: 'text',
        objects: [ {key:'door',icon:'🚪',name:'The Door'}, {key:'keyhole',icon:'🔑',name:'Keyhole'}, {key:'riddle',icon:'📜',name:'Ancient Riddle'} ],
        clues: {
          door: '🚪 Three keyholes. Engraving: "I open doors but have no hands. I am small but grant freedom. What am I?"',
          keyhole: '🔑 Inside the keyhole: "Three letters. Forged in metal, turned in locks. I am your salvation."',
          riddle: '📜 "I can be lost but never forgotten. I can be copied but remain unique. I unlock what binds you. I am a _ _ _."'
        },
        hint: 'What small metal object opens locks? 3 letters, starts with K...',
        scoreValue: 1000, inventoryReward: '🔑',
        roomTheme: { wallColor:'rgba(25,10,10,0.95)', lightColor:'rgba(198,40,40,0.08)' }
      }
    ],
    stories: {
      intro:   ["The year is 1892. You receive a letter from an unknown sender...", "\"Come to Blackwood Manor. The truth about your family awaits.\"", "Against all reason, you arrive at midnight. The door opens on its own...", "As you step inside, the door slams shut behind you. There is no way back."],
      room1:   ["The Study. Dust covers everything like a funeral shroud.", "A portrait on the wall seems to follow you with its eyes...", "Find the code. The desk holds the first secret."],
      room2:   ["A passage opens behind the bookshelf. Cold air rushes in.", "The walls are covered in symbols — an ancient cipher.", "Something whispers from the darkness ahead..."],
      room3:   ["Music. Distorted, broken, coming from everywhere and nowhere.", "A music box plays by itself. The melody is wrong.", "Fix the notes. Before the music drives you mad."],
      room4:   ["Mirrors. Endless reflections stretching into infinity.", "But wait — your reflection moved differently than you did.", "Numbers appear in the glass. A pattern waits to be solved."],
      room5:   ["The final door. Freedom is inches away.", "But the door won't yield to force. Only wisdom opens this lock.", "Solve the ancient riddle, or join the ghosts of those who failed."],
      victory: ["The door swings open. Moonlight floods in.", "You stumble outside, gasping. You're free.", "But as you look back... a face watches from the window.", "The manor will wait for the next visitor. It always does."],
      defeat:  ["Time has run out. The darkness closes in.", "You hear laughter echoing through the halls.", "The manor claims another soul...", "Perhaps the next visitor will be luckier than you."]
    }
  },

  // ────────── ASYLUM (7 rooms) ──────────
  asylum: {
    name: 'Abandoned Asylum', icon: '🧟', time: 720, hints: 4,
    bodyClass: 'theme-asylum',
    victoryMsg: (name) => `Subject ${name} has been discharged. The asylum loosens its grip... for now.`,
    defeatMsg:  (name) => `Patient ${name} has been permanently admitted. Treatment will continue indefinitely.`,
    puzzles: [
      {
        title: '🏥 Reception Ward', description: 'Flickering fluorescent lights cast a sickly green glow. A patient roster lies on the counter. The receptionist\'s chair is still warm...',
        answer: '4823', inputLabel: 'Enter the patient intake number:', inputMaxLength: 4, inputPlaceholder: '____', inputType: 'text',
        objects: [ {key:'roster',icon:'📋',name:'Patient Roster'}, {key:'clipboard',icon:'📎',name:'Clipboard'}, {key:'cabinet',icon:'🗄️',name:'File Cabinet'} ],
        clues: {
          roster: '📋 The roster shows: "Patient #48__ admitted 1953." The last two digits are smeared with medication.',
          clipboard: '📎 A doctor\'s note: "Intake = Floor number (4) × 1000 + Ward (8) × 100 + Bed (23)."',
          cabinet: '🗄️ Filing cabinet label: "Active Patients: 4800-4899. See bed 23, third floor annex."'
        },
        hint: 'The patient number follows: Floor(4) + Ward(8) + Bed(23) = 4823', scoreValue: 1000, inventoryReward: '🪪',
        roomTheme: { wallColor:'rgba(10,20,15,0.95)', lightColor:'rgba(0,200,80,0.06)' }
      },
      {
        title: '⚡ Electroshock Theater', description: 'Leather straps hang from a metal chair. On the wall, numbers flicker in sequence on a broken display. Each shock reveals the next digit...',
        answer: '64', inputLabel: 'What comes next in the shock sequence?', inputMaxLength: 4, inputPlaceholder: '?', inputType: 'text',
        objects: [ {key:'chair',icon:'🪑',name:'Metal Chair'}, {key:'display',icon:'📺',name:'Broken Display'}, {key:'dial',icon:'🔘',name:'Voltage Dial'} ],
        clues: {
          chair: '🪑 Scratched into the armrest: "2, 4, 8, 16, 32, __" — Each number doubles the last.',
          display: '📺 The display flickers: "Power sequence: ×2 ×2 ×2 ×2 ×2 — What is 32 × 2?"',
          dial: '🔘 The voltage dial is set to increments: 2V → 4V → 8V → 16V → 32V → ?V. "Double or die."'
        },
        hint: 'Each number is double the previous. 32 × 2 = ?', scoreValue: 1000, inventoryReward: '⚡',
        roomTheme: { wallColor:'rgba(15,18,10,0.95)', lightColor:'rgba(200,255,0,0.05)' }
      },
      {
        title: '🔬 Operating Theater', description: 'Surgical tools lie scattered across a rusted table. An anatomy chart on the wall has letters circled in red. The surgery was never completed...',
        answer: 'brain', inputLabel: 'What organ is the doctor obsessed with?', inputMaxLength: 20, inputPlaceholder: 'Type answer...', inputType: 'text',
        objects: [ {key:'chart',icon:'📊',name:'Anatomy Chart'}, {key:'tools',icon:'🔪',name:'Surgical Tools'}, {key:'journal',icon:'📓',name:'Doctor\'s Journal'} ],
        clues: {
          chart: '📊 Letters circled in red on the anatomy chart: B-R-A-I-N. An arrow points to the skull.',
          tools: '🔪 Engraved on the bone saw: "The seat of consciousness. Five letters. Controls everything."',
          journal: '📓 "Day 247: I must reach it. The organ that holds all secrets. Inside the skull. B _ _ _ N."'
        },
        hint: 'The organ inside the skull that controls everything. 5 letters. B _ _ I N', scoreValue: 1000, inventoryReward: '🧠',
        roomTheme: { wallColor:'rgba(15,15,12,0.95)', lightColor:'rgba(180,180,180,0.05)' }
      },
      {
        title: '🔒 Isolation Cell', description: 'Padded walls. No windows. Scratches cover every surface — tallies, symbols, and one repeating phrase. The patient is still counting...',
        answer: '144', inputLabel: 'What number did the patient keep writing?', inputMaxLength: 5, inputPlaceholder: '???', inputType: 'text',
        objects: [ {key:'wall_scratch',icon:'🧱',name:'Wall Scratches'}, {key:'mattress',icon:'🛏️',name:'Torn Mattress'}, {key:'grate',icon:'🪟',name:'Floor Grate'} ],
        clues: {
          wall_scratch: '🧱 Tallies organized in groups: "1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, __" — Fibonacci again?',
          mattress: '🛏️ Written inside the mattress foam: "The 12th number. 89 + 55 = ?" The patient knew mathematics.',
          grate: '🪟 Chalked on the grate: "Square of 12 = ?" and "55 + 89 = same answer." Both lead to one number.'
        },
        hint: '12² = 144, and in Fibonacci: 55 + 89 = 144', scoreValue: 1000, inventoryReward: '📝',
        roomTheme: { wallColor:'rgba(18,18,15,0.95)', lightColor:'rgba(120,120,80,0.05)' }
      },
      {
        title: '📁 Records Room', description: 'Floor-to-ceiling filing cabinets. A terminal glows green in the corner. Someone was searching for a specific file before they vanished...',
        answer: 'mercury', inputLabel: 'Enter the project codename:', inputMaxLength: 20, inputPlaceholder: 'Type codename...', inputType: 'text',
        objects: [ {key:'terminal',icon:'💻',name:'Green Terminal'}, {key:'files',icon:'📂',name:'Scattered Files'}, {key:'photo',icon:'🖼️',name:'Staff Photo'} ],
        clues: {
          terminal: '💻 Terminal reads: "ACCESS DENIED. Project _______ classified. Hint: First planet from the sun."',
          files: '📂 A folder labeled "Project M-E-R-C-U-R-Y" is half burned. Notes say: "Closest to the sun."',
          photo: '🖼️ Staff photo caption: "Dr. Roman\'s team — Project [REDACTED]. Named after the smallest planet."'
        },
        hint: 'The smallest planet, closest to the sun. Starts with M, 7 letters...', scoreValue: 1000, inventoryReward: '💾',
        roomTheme: { wallColor:'rgba(8,15,8,0.95)', lightColor:'rgba(0,255,65,0.06)' }
      },
      {
        title: '🧪 Basement Laboratory', description: 'Jars of specimens line the shelves. Chemicals bubble in beakers. A locked vault requires a chemical formula to open...',
        answer: 'h2o', inputLabel: 'Enter the formula to open the vault:', inputMaxLength: 10, inputPlaceholder: 'Formula...', inputType: 'text',
        objects: [ {key:'beaker',icon:'🧪',name:'Bubbling Beaker'}, {key:'periodic',icon:'📋',name:'Periodic Table'}, {key:'vault',icon:'🔐',name:'Sealed Vault'} ],
        clues: {
          beaker: '🧪 The beaker contains clear liquid. Label reads: "Universal solvent. Two hydrogen, one oxygen."',
          periodic: '📋 Circled on the periodic table: H (×2) and O (×1). "The molecule of life."',
          vault: '🔐 Vault inscription: "I cover 71% of Earth. I fall from clouds. I am _ 2 _. What am I?"'
        },
        hint: 'Water! Two hydrogen atoms + one oxygen atom = H₂O', scoreValue: 1000, inventoryReward: '🧪',
        roomTheme: { wallColor:'rgba(10,12,18,0.95)', lightColor:'rgba(0,150,255,0.05)' }
      },
      {
        title: '🚪 Emergency Exit', description: 'Red emergency lights pulse. The fire door has a keypad. Alarms blare as the building begins its nightly lockdown. You have seconds...',
        answer: '911', inputLabel: 'Enter the emergency override code:', inputMaxLength: 5, inputPlaceholder: '_ _ _', inputType: 'text',
        objects: [ {key:'alarm',icon:'🚨',name:'Alarm Panel'}, {key:'poster',icon:'📋',name:'Emergency Poster'}, {key:'keypad',icon:'🔢',name:'Door Keypad'} ],
        clues: {
          alarm: '🚨 The alarm panel flashes: "In case of emergency, dial the universal distress number."',
          poster: '📋 Emergency poster: "FOR HELP: Dial the number everyone knows. Three digits. Nine-One-One."',
          keypad: '🔢 Worn keys: 9, 1, and 1 are almost unreadable from overuse. "Call for help."'
        },
        hint: 'The universal emergency number. Everyone knows it. 9-1-1', scoreValue: 1000, inventoryReward: '🔑',
        roomTheme: { wallColor:'rgba(20,8,8,0.95)', lightColor:'rgba(255,0,0,0.06)' }
      }
    ],
    stories: {
      intro:   ["Greenbriar Asylum. Closed since 1971. Or so they said.", "You came for a story. An investigation into the rumors.", "The front door locks behind you. Your phone has no signal.", "The intercom crackles: \"Welcome, new patient. Processing begins now.\""],
      room1:   ["The reception area. Dust sheets cover everything.", "A phone rings — but it's not connected to anything.", "The patient roster has your name already written in it..."],
      room2:   ["Down the corridor. The lights won't stop flickering.", "A chair sits in the center. Leather straps still wet.", "Numbers flash on a broken screen. A pattern demands attention."],
      room3:   ["The operating theater. Illuminated by a single swinging bulb.", "Tools arranged with surgical precision. Recently used.", "A journal lies open. The doctor's obsession fills every page."],
      room4:   ["Isolation. Padded walls absorb all sound.", "Someone was here. For a very long time.", "Numbers everywhere. A brilliant mind, trapped and counting."],
      room5:   ["Basement stairs. The air is different down here. Clinical.", "A green terminal hums. Files scattered like someone left in a hurry.", "What were they hiding? The answer is in the records."],
      room6:   ["Deeper still. A laboratory that shouldn't exist.", "Specimens in jars. Experiments no ethics board approved.", "A vault. Sealed with science. Think like a chemist."],
      room7:   ["Red lights. Alarms. The asylum is locking down.", "One exit. One keypad. One chance.", "Enter the code, or become a permanent resident."],
      victory: ["The fire door bursts open. Cool night air hits your face.", "You run. You don't look back.", "Your phone finds signal. But a text arrives: \"See you again soon, patient.\"", "Greenbriar Asylum will accept new patients. It always does."],
      defeat:  ["LOCKDOWN COMPLETE. All exits sealed.", "\"Patient secured. Begin treatment protocol.\"", "The fluorescent lights dim to their nighttime setting.", "You are now a permanent resident of Greenbriar Asylum."]
    }
  },

  // ────────── CATACOMBS (10 rooms) ──────────
  catacombs: {
    name: 'The Catacombs', icon: '💀', time: 900, hints: 5,
    bodyClass: 'theme-catacombs',
    victoryMsg: (name) => `${name} climbed from the abyss. The catacombs remember your footsteps.`,
    defeatMsg:  (name) => `${name}'s bones will join the millions already resting in the catacombs.`,
    puzzles: [
      {
        title: '⛩️ The Entrance', description: 'Stone stairs descend into total darkness. Roman numerals are etched above the archway. An ancient mechanism guards the first passage...',
        answer: '17', inputLabel: 'What number do the Roman numerals represent?', inputMaxLength: 5, inputPlaceholder: '??', inputType: 'text',
        objects: [ {key:'archway',icon:'🏛️',name:'Stone Archway'}, {key:'torch_holder',icon:'🔥',name:'Torch Holder'}, {key:'inscription',icon:'📜',name:'Wall Inscription'} ],
        clues: {
          archway: '🏛️ Carved above: "XVII" — Roman numerals. X=10, V=5, I=1, I=1.',
          torch_holder: '🔥 Scratched into the bronze: "Ten, five, one, one. Add them."',
          inscription: '📜 "Sum the symbols of Rome: X + V + I + I = ? Only the worthy may descend."'
        },
        hint: 'XVII in Roman numerals: X(10) + V(5) + I(1) + I(1) = ?', scoreValue: 1000, inventoryReward: '🔥',
        roomTheme: { wallColor:'rgba(20,15,8,0.95)', lightColor:'rgba(255,140,0,0.08)' }
      },
      {
        title: '💀 Bone Gallery', description: 'Walls of skulls stare at you. Each skull has a number carved into the forehead. The bones whisper their count...',
        answer: '206', inputLabel: 'How many bones does a human body contain?', inputMaxLength: 5, inputPlaceholder: '???', inputType: 'text',
        objects: [ {key:'skulls',icon:'💀',name:'Skull Wall'}, {key:'plaque',icon:'🪧',name:'Bronze Plaque'}, {key:'skeleton',icon:'🦴',name:'Full Skeleton'} ],
        clues: {
          skulls: '💀 Numbers carved into skulls form an equation: "80 + 126 = ?" — cranial + axial skeleton counts.',
          plaque: '🪧 "The adult human frame: two-hundred and six. No more, no less."',
          skeleton: '🦴 A complete skeleton hangs, labeled: "Specimen contains 206 individual bones. Count: _ _ 6"'
        },
        hint: 'The total number of bones in an adult human body. Two hundred and...', scoreValue: 1000, inventoryReward: '🦴',
        roomTheme: { wallColor:'rgba(18,14,8,0.95)', lightColor:'rgba(200,160,100,0.06)' }
      },
      {
        title: '🕳️ The Well Room', description: 'A deep well in the center of the chamber. Drops of water fall — you count the seconds before the splash...',
        answer: '5', inputLabel: 'How many seconds until the splash?', inputMaxLength: 3, inputPlaceholder: '?', inputType: 'text',
        objects: [ {key:'wellrim',icon:'🕳️',name:'Well Rim'}, {key:'pebble',icon:'🪨',name:'Stone Pebble'}, {key:'carving',icon:'📏',name:'Depth Carving'} ],
        clues: {
          wellrim: '🕳️ Etched on the rim: "Depth = ½ × g × t². If depth = 122.5m and g = 9.8... solve for t."',
          pebble: '🪨 A note tied to a pebble: "Drop me. Count slowly. The answer is the number of seconds."',
          carving: '📏 Carved depth markings: "122.5 meters to water. Free-fall time ≈ 5 seconds."'
        },
        hint: 'The depth is marked as 122.5m. Free fall formula: t ≈ √(2d/g) ≈ 5 seconds', scoreValue: 1000, inventoryReward: '💧',
        roomTheme: { wallColor:'rgba(12,15,20,0.95)', lightColor:'rgba(80,130,200,0.05)' }
      },
      {
        title: '🏺 Crypt of the Ancients', description: 'Sarcophagi line the walls, each bearing a different ancient symbol. The floor tiles form a puzzle that must be walked in order...',
        answer: 'osiris', inputLabel: 'Name the god of the underworld:', inputMaxLength: 20, inputPlaceholder: 'Type name...', inputType: 'text',
        objects: [ {key:'sarcophagus',icon:'⚱️',name:'Golden Sarcophagus'}, {key:'hieroglyphs',icon:'🏺',name:'Hieroglyphs'}, {key:'ankh',icon:'☥',name:'Ankh Symbol'} ],
        clues: {
          sarcophagus: '⚱️ The lid depicts a green-skinned god holding a crook and flail. "Lord of the Dead."',
          hieroglyphs: '🏺 Hieroglyphs translate: "He who rules the afterlife. O-S-I-R-I-S. Judge of the dead."',
          ankh: '☥ The ankh inscription: "Brother of Set. Husband of Isis. God of the underworld. _ _ _ R _ S."'
        },
        hint: 'Egyptian god of the underworld. Green skin, crook and flail. O _ _ _ _ S', scoreValue: 1000, inventoryReward: '☥',
        roomTheme: { wallColor:'rgba(22,18,8,0.95)', lightColor:'rgba(218,165,32,0.06)' }
      },
      {
        title: '🧭 The Labyrinth', description: 'Branching tunnels in every direction. A compass embedded in the floor. The correct path follows a cardinal direction...',
        answer: 'north', inputLabel: 'Which direction leads to safety?', inputMaxLength: 10, inputPlaceholder: 'Direction...', inputType: 'text',
        objects: [ {key:'compass',icon:'🧭',name:'Floor Compass'}, {key:'moss',icon:'🌿',name:'Wall Moss'}, {key:'map_frag',icon:'🗺️',name:'Map Fragment'} ],
        clues: {
          compass: '🧭 The compass needle points firmly in one direction. An inscription: "Follow where the needle points."',
          moss: '🌿 Moss grows thickest on one wall. "In caves, moss grows toward light. Light comes from the exit."',
          map_frag: '🗺️ A torn map shows the exit directly above. An arrow labeled "N" — "Surface lies northward."'
        },
        hint: 'The compass points to it. Moss grows toward light from above. Which cardinal direction?', scoreValue: 1000, inventoryReward: '🧭',
        roomTheme: { wallColor:'rgba(14,16,12,0.95)', lightColor:'rgba(100,160,80,0.05)' }
      },
      {
        title: '☠️ Poison Chamber', description: 'Three chalices sit on a stone altar. One holds water, one holds poison, one holds the antidote. Choose wisely...',
        answer: 'blue', inputLabel: 'Which chalice is safe? (color)', inputMaxLength: 10, inputPlaceholder: 'Color...', inputType: 'text',
        objects: [ {key:'red_cup',icon:'🔴',name:'Red Chalice'}, {key:'blue_cup',icon:'🔵',name:'Blue Chalice'}, {key:'green_cup',icon:'🟢',name:'Green Chalice'} ],
        clues: {
          red_cup: '🔴 "I am the color of blood, the color of danger. I am NEVER the safe choice." The red chalice steams.',
          blue_cup: '🔵 "I am the color of the sky, the color of water, the color of calm. Truth lives in tranquility."',
          green_cup: '🟢 "I am the color of poison, envy, and sickness. I deceive." The green liquid bubbles faintly.'
        },
        hint: 'Red = danger. Green = poison. What color represents water, sky, and calm?', scoreValue: 1000, inventoryReward: '🏆',
        roomTheme: { wallColor:'rgba(15,10,18,0.95)', lightColor:'rgba(128,0,128,0.05)' }
      },
      {
        title: '⚖️ The Bridge', description: 'A narrow stone bridge over a bottomless chasm. The bridge will only hold a specific weight. A scale mechanism requires the correct balance...',
        answer: '50', inputLabel: 'How many kg must you place on the scale?', inputMaxLength: 5, inputPlaceholder: '?? kg', inputType: 'text',
        objects: [ {key:'scale',icon:'⚖️',name:'Balance Scale'}, {key:'stones',icon:'🪨',name:'Stone Weights'}, {key:'plaque2',icon:'📜',name:'Bridge Plaque'} ],
        clues: {
          scale: '⚖️ One side holds 50kg. The other is empty. "Balance the scales and the bridge holds."',
          stones: '🪨 Stone weights labeled: 10, 20, 20, 50, 100. "Choose one that matches the other side."',
          plaque2: '📜 "Equal weight, equal passage. The scale reads fifty. Match it exactly."'
        },
        hint: 'The scale has 50kg on one side. You need to match it. Simple!', scoreValue: 1000, inventoryReward: '⚖️',
        roomTheme: { wallColor:'rgba(16,14,14,0.95)', lightColor:'rgba(160,140,120,0.05)' }
      },
      {
        title: '🔔 Hall of Echoes', description: 'A vast chamber where every sound reverberates endlessly. Bronze bells hang from the ceiling. Play the right notes or the ceiling collapses...',
        answer: 'CEGCE', inputLabel: 'Play the correct bell sequence:', inputMaxLength: 10, inputPlaceholder: '_ _ _ _ _', inputType: 'notes',
        objects: [ {key:'bells',icon:'🔔',name:'Bronze Bells'}, {key:'echo_wall',icon:'🧱',name:'Echo Wall'}, {key:'score_card',icon:'🎼',name:'Score Card'} ],
        clues: {
          bells: '🔔 Five bells are polished clean: C, E, G, C, E. The rest are covered in dust.',
          echo_wall: '🧱 The echo repeats: "C... E... G... C... E..." The walls remember the melody.',
          score_card: '🎼 A musical score shows a C-major arpeggio ascending: C-E-G-C-E. "Play harmony."'
        },
        hint: 'A C-major arpeggio: C, E, G, then repeat C, E. Five notes total.', scoreValue: 1000, inventoryReward: '🔔',
        roomTheme: { wallColor:'rgba(18,16,20,0.95)', lightColor:'rgba(180,150,220,0.05)' }
      },
      {
        title: '🗿 The Altar', description: 'A sacrificial altar glows with an otherworldly light. Ancient text demands an offering of knowledge. The final test of wisdom...',
        answer: '42', inputLabel: 'What is the ultimate answer?', inputMaxLength: 5, inputPlaceholder: '??', inputType: 'text',
        objects: [ {key:'altar_stone',icon:'🗿',name:'Altar Stone'}, {key:'candles',icon:'🕯️',name:'Ritual Candles'}, {key:'tome',icon:'📖',name:'Ancient Tome'} ],
        clues: {
          altar_stone: '🗿 Engraved: "What is the answer to the ultimate question of life, the universe, and everything?"',
          candles: '🕯️ 42 candles burn. "Count the flames. The number IS the answer."',
          tome: '📖 The tome quotes: "The answer is forty-two. — The Guide" Pages 4 and 2 are bookmarked.'
        },
        hint: 'The answer to life, the universe, and everything... from The Hitchhiker\'s Guide. 4 _ ', scoreValue: 1000, inventoryReward: '📖',
        roomTheme: { wallColor:'rgba(20,12,12,0.95)', lightColor:'rgba(200,80,80,0.06)' }
      },
      {
        title: '🌅 The Ascent', description: 'A spiral staircase leading up. Daylight filters from above. One final lock stands between you and the surface. A riddle carved millennia ago...',
        answer: 'time', inputLabel: 'Solve the ancient riddle:', inputMaxLength: 20, inputPlaceholder: 'Type answer...', inputType: 'text',
        objects: [ {key:'lock_final',icon:'🔐',name:'Ancient Lock'}, {key:'sundial',icon:'☀️',name:'Sundial'}, {key:'epitaph',icon:'📜',name:'Stone Epitaph'} ],
        clues: {
          lock_final: '🔐 "I fly without wings. I am never present, never future, always gone. What am I?"',
          sundial: '☀️ The sundial\'s shadow moves. "I am measured but never touched. I heal all wounds."',
          epitaph: '📜 "I am free but priceless. You can\'t own me but you can use me. You can\'t keep me but you can spend me. I am _ _ _ _."'
        },
        hint: 'It flies, heals wounds, cannot be touched, and can be spent. 4 letters. T _ _ _', scoreValue: 1000, inventoryReward: '🗝️',
        roomTheme: { wallColor:'rgba(22,18,12,0.95)', lightColor:'rgba(255,200,80,0.08)' }
      }
    ],
    stories: {
      intro:    ["Paris, 1786. The tunnels beneath the city have been sealed for centuries.", "A map arrives with no return address. Drawn in what appears to be blood.", "You descend the 130 steps alone. The entrance collapses behind you.", "Six million souls rest here. Now you must find your way through all of them."],
      room1:    ["The entrance. Ancient stone. Roman letters chiseled by hands long turned to dust.", "A mechanism hums. The ancients built this place to keep something IN.", "Prove your worth. Solve what the Romans left behind."],
      room2:    ["The gallery of bones. Walls made of the dead, stacked with eerie precision.", "Each skull watches. Each skull knows the answer.", "How well do you know the human body?"],
      room3:    ["Water. You hear it echoing from far, far below.", "A well cuts through the earth itself. The darkness below is absolute.", "Physics will save you here. Calculate, or fall."],
      room4:    ["Gold gleams. Ancient sarcophagi from a civilization that worshipped death.", "The gods of old still guard this place.", "Name the ruler of the dead, or join his kingdom."],
      room5:    ["Tunnels branch in every direction. Identical. Endless.", "Without direction, you wander forever.", "Find true north. Find the exit."],
      room6:    ["An altar of three chalices. The ancient trial of wisdom.", "Drink, and live. Drink wrong, and...", "Color holds the truth. Read the signs carefully."],
      room7:    ["A bridge over nothing. The void below has no bottom.", "Weight and balance. The ancients understood physics.", "The scale demands equilibrium."],
      room8:    ["Sound. Everywhere. Your own heartbeat echoes back at you, distorted.", "Bronze bells. A melody locked in time.", "Play the harmony. Silence the chaos."],
      room9:    ["The altar. The final trial of knowledge.", "A question as old as philosophy itself.", "The answer is simpler than you think."],
      room10:   ["Light. Above. After hours in darkness, you see the sky.", "One final lock. One final riddle.", "Solve it. Earn your freedom from the bones of Paris."],
      victory:  ["The lock opens. You climb. Each step lighter than the last.", "Sunlight. Air. You collapse on the grass of a Parisian park.", "Below you, the catacombs seal themselves once more.", "Six million dead witnessed your journey. You earned their respect."],
      defeat:   ["The torches gutter. One by one, darkness claims each passage.", "You are lost. The map has crumbled.", "The catacombs add one more to their number.", "Your bones will rest among millions. For eternity."]
    }
  },

  // ═══════════════════════════════════════════════
  //  QUANTUM TIME LOOP (PREMIUM) — 4 puzzles
  // ═══════════════════════════════════════════════
  quantum: {
    name: 'Quantum Time Loop',
    icon: '⏳',
    time: 540,
    hints: 3,
    bodyClass: 'theme-quantum',
    victoryMsg: n => `${n}, you collapsed the wavefunction and escaped the loop!`,
    defeatMsg:  n => `${n}, the timeline fractured. You are stuck forever between moments.`,
    puzzles: [
      {
        title: 'The Temporal Rift',
        description: 'A shimmering tear in reality reveals dates spiraling backward. The chronometer demands an answer from scientific history.',
        answer: '1905',
        inputLabel: 'Enter the year:',
        inputMaxLength: 4,
        inputPlaceholder: 'Year...',
        inputType: 'text',
        objects: [
          { emoji: '🕰️', name: 'Fractured Chronometer', clue: 'The device reads: "In what year did Einstein publish special relativity?"' },
          { emoji: '📜', name: 'Faded Journal Page', clue: '"The miraculous year... Annus Mirabilis... when physics changed forever."' },
          { emoji: '⚡', name: 'Energy Signature', clue: 'E = mc². The equation that rewrote the universe. What year was it born?' }
        ],
        clues: ['Think of Einstein\'s miracle year', 'The answer is in the early 20th century', 'Annus Mirabilis = 1905'],
        hint: 'Einstein\'s special relativity was published in his "miracle year".',
        scoreValue: 200,
        inventoryReward: '🔮',
        roomTheme: 'quantum-rift'
      },
      {
        title: 'Paradox Chamber',
        description: 'A sealed box hums with quantum uncertainty. Something is both alive and dead inside. The lock displays a famous thought experiment.',
        answer: 'cat',
        inputLabel: 'What\'s inside?',
        inputMaxLength: 10,
        inputPlaceholder: 'Answer...',
        inputType: 'text',
        objects: [
          { emoji: '📦', name: 'Sealed Box', clue: 'The label reads: "Schrödinger\'s ____". What is inside the famous thought experiment?' },
          { emoji: '☢️', name: 'Geiger Counter', clue: 'Radioactive decay triggers the mechanism. The subject is a common pet.' },
          { emoji: '🔬', name: 'Quantum Paper', clue: '"Until observed, it exists in superposition — both alive and dead."' }
        ],
        clues: ['Schrödinger is famous for this paradox', 'The experiment involves an animal', 'Think feline'],
        hint: 'Schrödinger\'s famous thought experiment involves a common household pet.',
        scoreValue: 200,
        inventoryReward: '🗝️',
        roomTheme: 'quantum-paradox'
      },
      {
        title: 'Time Crystal Lab',
        description: 'Floating crystals pulse in patterns outside normal time. A holographic display asks about the fabric of spacetime.',
        answer: '4',
        inputLabel: 'How many dimensions?',
        inputMaxLength: 2,
        inputPlaceholder: 'Number...',
        inputType: 'number',
        objects: [
          { emoji: '💎', name: 'Time Crystal', clue: 'The crystal resonates: "How many dimensions make up spacetime? Length, width, height, and..."' },
          { emoji: '🌌', name: 'Spacetime Map', clue: 'Three spatial dimensions plus one temporal dimension. The answer is their sum.' },
          { emoji: '📐', name: 'Minkowski Diagram', clue: '"x, y, z, t — the four coordinates of any event in the universe."' }
        ],
        clues: ['3 spatial + 1 temporal', 'Think of x, y, z, and time', 'A single digit number'],
        hint: 'Spacetime has 3 spatial dimensions plus time.',
        scoreValue: 250,
        inventoryReward: '💠',
        roomTheme: 'quantum-crystal'
      },
      {
        title: 'The Chronos Gate',
        description: 'The final portal shudders between moments. To pass through, name the hypothetical faster-than-light particle.',
        answer: 'tachyon',
        inputLabel: 'Name the particle:',
        inputMaxLength: 15,
        inputPlaceholder: 'Particle name...',
        inputType: 'text',
        objects: [
          { emoji: '🚀', name: 'FTL Drive Fragment', clue: '"What theoretical particle could travel faster than light?"' },
          { emoji: '⚛️', name: 'Particle Detector', clue: 'Greek root "tachys" means swift. The particle was named from this.' },
          { emoji: '🌀', name: 'Wormhole Lens', clue: '"Gerald Feinberg proposed it in 1967 — a particle with imaginary mass."' }
        ],
        clues: ['It derives from the Greek word for "swift"', 'Named by Gerald Feinberg', 'Starts with T, ends with N'],
        hint: 'The hypothetical FTL particle name comes from Greek "tachys" (swift).',
        scoreValue: 300,
        inventoryReward: '🪪',
        roomTheme: 'quantum-gate'
      }
    ],
    stories: {
      intro:  ["The lab flickers. Time stutters.", "A quantum experiment gone wrong has trapped you in a recursive time loop.", "Each room is a fragment of a collapsed timeline.", "Solve the paradoxes. Restore causality. Escape the loop."],
      room1:  ["Reality tears open. Dates and equations spiral in the air.", "A chronometer demands historical truth to stabilize the rift.", "Answer correctly before the timeline collapses further."],
      room2:  ["The air hums with superposition. A sealed box awaits.", "Something is both alive and dead until you observe it.", "Schrödinger's legacy holds the key."],
      room3:  ["Crystals float outside time, pulsing with impossible patterns.", "The fabric of spacetime reveals itself in their facets.", "Count the dimensions to proceed."],
      room4:  ["The Chronos Gate. The final barrier between you and linear time.", "Name the impossible particle and the loop will break.", "Get it wrong, and you restart. Again. And again."],
      victory:["The loop shatters! Time flows forward once more.", "You stumble through the gate as reality snaps back into place.", "Behind you, the lab collapses into a singularity.", "You escaped the time loop. Few ever do."],
      defeat: ["The loop resets. You feel déjà vu — again.", "Time folds in on itself. You've been here before. You'll be here again.", "The quantum prison is eternal.", "You are the paradox now."]
    }
  },

  // ═══════════════════════════════════════════════
  //  CYBERPUNK NEON DISTRICT — 4 puzzles
  // ═══════════════════════════════════════════════
  cyberpunk: {
    name: 'Cyberpunk Neon District',
    icon: '🌃',
    time: 600,
    hints: 3,
    bodyClass: 'theme-cyberpunk',
    victoryMsg: n => `${n}, you jacked out of the Neon District with the data intact!`,
    defeatMsg:  n => `${n}, corporate ICE flatlined your neural link. Game over, choom.`,
    puzzles: [
      {
        title: 'Neon Alley Terminal',
        description: 'A rain-soaked terminal in a back alley flickers to life. It requires binary knowledge to access the underground network.',
        answer: 'a',
        inputLabel: 'Enter the ASCII letter:',
        inputMaxLength: 5,
        inputPlaceholder: 'Letter...',
        inputType: 'text',
        objects: [
          { emoji: '💻', name: 'Street Terminal', clue: '"01000001 in binary. What ASCII character does this represent?"' },
          { emoji: '📟', name: 'ASCII Chart Shard', clue: 'The chart fragment shows: 65 = A (uppercase), 97 = a (lowercase). Binary 01000001 = 65.' },
          { emoji: '🔌', name: 'Data Cable', clue: '"Binary to decimal: 64+1=65. In ASCII, 65 is the first uppercase letter."' }
        ],
        clues: ['Convert binary to decimal first: 01000001 = 65', '65 in ASCII is a letter', 'The first letter of the alphabet'],
        hint: 'Binary 01000001 = decimal 65 = ASCII "A".',
        scoreValue: 150,
        inventoryReward: '🔑',
        roomTheme: 'cyber-alley'
      },
      {
        title: 'Black Market Server',
        description: 'A hidden server room behind a noodle shop. The firewall asks about hex color codes to verify you\'re a real netrunner.',
        answer: 'red',
        inputLabel: 'What color is #FF0000?',
        inputMaxLength: 10,
        inputPlaceholder: 'Color...',
        inputType: 'text',
        objects: [
          { emoji: '🖥️', name: 'Server Rack', clue: '"In RGB hex notation, #FF0000 represents which primary color?"' },
          { emoji: '🎨', name: 'Color Palette', clue: 'FF = maximum (255). The value is in the R channel only. G and B are 00.' },
          { emoji: '📊', name: 'Hex Reference', clue: '"#FF0000 = R:255 G:0 B:0. Maximum red, zero green, zero blue."' }
        ],
        clues: ['FF is the maximum value (255)', 'Only the first color channel has a value', 'RGB: all red, no green, no blue'],
        hint: 'The hex code has full red (FF) and no green or blue (00).',
        scoreValue: 175,
        inventoryReward: '💿',
        roomTheme: 'cyber-server'
      },
      {
        title: 'Corpo Data Vault',
        description: 'Deep inside Arasaka Tower, the vault door displays an HTTP error you\'ve seen a thousand times on your hacking runs.',
        answer: '404',
        inputLabel: 'Error code:',
        inputMaxLength: 3,
        inputPlaceholder: 'Code...',
        inputType: 'number',
        objects: [
          { emoji: '🏢', name: 'Vault Terminal', clue: '"The most famous HTTP error status code. Page Not Found."' },
          { emoji: '📱', name: 'Error Log', clue: 'HTTP 4xx = client errors. This one is the most commonly seen on the web.' },
          { emoji: '🗂️', name: 'Network Manual', clue: '"When a requested resource cannot be found on the server, this code is returned."' }
        ],
        clues: ['HTTP client error for missing pages', 'You see this when a webpage doesn\'t exist', 'Starts with 4, ends with 4'],
        hint: 'The most famous HTTP error code for "Page Not Found".',
        scoreValue: 150,
        inventoryReward: '🪪',
        roomTheme: 'cyber-vault'
      },
      {
        title: 'The Upload Gate',
        description: 'The final upload point. To jack out clean, prove you understand the technology that changed the world.',
        answer: 'artificial intelligence',
        inputLabel: 'What does AI stand for?',
        inputMaxLength: 30,
        inputPlaceholder: 'Full name...',
        inputType: 'text',
        objects: [
          { emoji: '🧠', name: 'Neural Interface', clue: '"AI" — two letters that reshaped civilization. What do they stand for?' },
          { emoji: '🤖', name: 'Humanoid Frame', clue: 'The first word means "man-made" or "synthetic". The second means "thinking ability".' },
          { emoji: '📡', name: 'Data Stream', clue: '"Alan Turing asked \'Can machines think?\' This field was born from that question."' }
        ],
        clues: ['A = Artificial', 'I = Intelligence', 'Two-word phrase about machine thinking'],
        hint: 'AI stands for a two-word phrase about synthetic thinking.',
        scoreValue: 200,
        inventoryReward: '🔐',
        roomTheme: 'cyber-gate'
      }
    ],
    stories: {
      intro:  ["Night City. 2087. Neon bleeds through acid rain.", "You're a netrunner hired to steal data from the most secure vault in the district.", "Four checkpoints. Four firewalls. One chance.", "Jack in. Don't flatline."],
      room1:  ["The back alley. Puddles reflect holographic ads.", "A terminal waits behind a dumpster. Your entry point.", "Prove you speak binary to get past the first gate."],
      room2:  ["Through the noodle shop's false wall. A hidden server farm.", "The air is cold. Blue LEDs pulse in darkness.", "Crack the color code to breach the firewall."],
      room3:  ["Corporate territory. Arasaka Tower's lower vault.", "Security drones patrol. One wrong move and ICE will fry your brain.", "Answer the vault's challenge to access the data core."],
      room4:  ["The upload point. Your extraction awaits.", "Upload the stolen data and jack out — if you can answer one last question.", "The fate of the underground depends on your knowledge."],
      victory:["Data uploaded. Neural link clean. You jack out.", "In a dirty apartment, you pull the trodes from your temples.", "Night City glows outside. The corps don't know what hit them.", "Another successful run. The neon district whispers your legend."],
      defeat: ["ICE breach! Neural feedback overload!", "Your avatar dissolves in the data stream.", "In the real world, your nose is bleeding. Screen goes dark.", "Flatlined. Night City chews up another netrunner."]
    }
  },

  // ═══════════════════════════════════════════════
  //  UNDERWATER RESEARCH BASE — 4 puzzles
  // ═══════════════════════════════════════════════
  underwater: {
    name: 'Underwater Research Base',
    icon: '🌊',
    time: 480,
    hints: 3,
    bodyClass: 'theme-underwater',
    victoryMsg: n => `${n}, you reached the surface! The deep released you — this time.`,
    defeatMsg:  n => `${n}, the pressure crushed the last airlock. The abyss claims another.`,
    puzzles: [
      {
        title: 'Flooded Corridor',
        description: 'Knee-deep in seawater, the emergency door asks for basic chemistry to unseal. The salt water is your clue.',
        answer: 'nacl',
        inputLabel: 'Chemical formula for salt:',
        inputMaxLength: 10,
        inputPlaceholder: 'Formula...',
        inputType: 'text',
        objects: [
          { emoji: '🧪', name: 'Corroded Test Kit', clue: '"What is the chemical formula for common table salt? Sodium + Chlorine."' },
          { emoji: '🧂', name: 'Salt Crystal', clue: 'Na for sodium, Cl for chlorine. Combined, they make the salt in the water around you.' },
          { emoji: '📋', name: 'Lab Manifest', clue: '"Sample 001: Sodium Chloride — NaCl. The compound flooding this facility."' }
        ],
        clues: ['Sodium = Na, Chlorine = Cl', 'Combine the two chemical symbols', 'No spaces, no special characters'],
        hint: 'Table salt is Sodium Chloride — combine their chemical symbols.',
        scoreValue: 150,
        inventoryReward: '🔧',
        roomTheme: 'underwater-corridor'
      },
      {
        title: 'Pressure Control',
        description: 'The pressure control room. Gauges spin wildly. The system asks about water pressure basics to recalibrate.',
        answer: '10',
        inputLabel: 'Depth in meters:',
        inputMaxLength: 4,
        inputPlaceholder: 'Meters...',
        inputType: 'number',
        objects: [
          { emoji: '📊', name: 'Pressure Gauge', clue: '"At approximately what depth (in meters) does water pressure double from sea level (2 atm)?"' },
          { emoji: '📏', name: 'Depth Chart', clue: 'Every 10 meters of seawater adds approximately 1 atmosphere of pressure.' },
          { emoji: '🔧', name: 'Calibration Tool', clue: '"1 atm at surface + 1 atm per 10m of water. At 10m depth = 2 atm total."' }
        ],
        clues: ['Pressure increases by 1 atm per 10m', 'Sea level is 1 atm', 'Double means 2 atm total'],
        hint: 'Water pressure increases by about 1 atmosphere for every 10 meters of depth.',
        scoreValue: 175,
        inventoryReward: '⌚',
        roomTheme: 'underwater-pressure'
      },
      {
        title: 'Bio Lab',
        description: 'The marine biology lab is half-flooded. Specimens float in broken tanks. The exit requires oceanic knowledge.',
        answer: 'pacific',
        inputLabel: 'Name the ocean:',
        inputMaxLength: 15,
        inputPlaceholder: 'Ocean...',
        inputType: 'text',
        objects: [
          { emoji: '🗺️', name: 'Ocean Map', clue: '"Which is the largest ocean on Earth? It covers more area than all the land combined."' },
          { emoji: '🐋', name: 'Whale Specimen Tag', clue: 'Named by Magellan. "Peaceful" in intent, yet home to the Ring of Fire.' },
          { emoji: '📖', name: 'Research Log', clue: '"Our base sits in the deepest ocean on Earth. The ____ Ocean covers 63 million square miles."' }
        ],
        clues: ['It covers one-third of Earth\'s surface', 'Magellan named it from the Latin for "peaceful"', 'The deepest point: Mariana Trench'],
        hint: 'The largest ocean on Earth was named "peaceful" by Magellan.',
        scoreValue: 175,
        inventoryReward: '🧬',
        roomTheme: 'underwater-lab'
      },
      {
        title: 'Emergency Airlock',
        description: 'The final airlock to the escape pod. Life support is failing. The system needs you to identify the gas of life.',
        answer: 'oxygen',
        inputLabel: 'Name the gas:',
        inputMaxLength: 15,
        inputPlaceholder: 'Gas...',
        inputType: 'text',
        objects: [
          { emoji: '💨', name: 'Gas Analyzer', clue: '"What gas makes up approximately 21% of Earth\'s atmosphere?" You breathe it to survive.' },
          { emoji: '🫁', name: 'Life Support Panel', clue: 'Chemical symbol: O₂. Without it, you have roughly 3 minutes.' },
          { emoji: '⚗️', name: 'Element Chart', clue: '"Element 8. Discovered by Priestley and Scheele. Essential for combustion and respiration."' }
        ],
        clues: ['You breathe it', 'About 21% of the atmosphere', 'Element number 8 on the periodic table'],
        hint: 'The gas you breathe, making up about 21% of air. Element #8.',
        scoreValue: 200,
        inventoryReward: '🚀',
        roomTheme: 'underwater-airlock'
      }
    ],
    stories: {
      intro:  ["Depth: 3,800 meters. The Marianas Research Station.", "An earthquake has breached the outer hull. Water is flooding in.", "Your oxygen is limited. Every second counts.", "Solve the locks. Reach the escape pod. Breathe."],
      room1:  ["Seawater rushes past your ankles. Emergency lights strobe red.", "The corridor's emergency seal requires a chemistry answer.", "Think fast. The water is rising."],
      room2:  ["The pressure control room. Warning klaxons blare.", "Recalibrate the equalizers or the station will implode.", "Every meter of depth is a thousand pounds of force."],
      room3:  ["The bio lab. Shattered tanks. Bioluminescent specimens drift in the flood.", "The exit demands oceanic knowledge from the research database.", "The station groans under immense pressure."],
      room4:  ["The escape pod airlock. Your last chance.", "Oxygen tanks are nearly empty. The lock asks one final question.", "Answer it. Breathe. Survive."],
      victory:["The airlock seals. The pod launches upward.", "Pressure decreases. Light grows. The surface approaches.", "You break the waves gasping. A rescue helicopter circles above.", "3,800 meters of ocean couldn't hold you."],
      defeat: ["The hull cracks. Water floods in from every direction.", "The lights fail. Absolute darkness at 3,800 meters.", "The pressure is the last thing you feel.", "The abyss doesn't give up its dead."]
    }
  },

  // ═══════════════════════════════════════════════
  //  HAUNTED VICTORIAN MANSION — 4 puzzles
  // ═══════════════════════════════════════════════
  victorian: {
    name: 'Haunted Victorian Mansion',
    icon: '🏚️',
    time: 600,
    hints: 3,
    bodyClass: 'theme-victorian',
    victoryMsg: n => `${n}, you escaped the mansion! The spirits weep, but the living prevail.`,
    defeatMsg:  n => `${n}, the mansion has claimed your soul. Another portrait joins the gallery.`,
    puzzles: [
      {
        title: 'The Drawing Room',
        description: 'Gas lamps flicker and die. A Victorian riddle is etched into the mantelpiece about the fuel that lit an era.',
        answer: 'coal',
        inputLabel: 'Gaslight fuel source:',
        inputMaxLength: 15,
        inputPlaceholder: 'Answer...',
        inputType: 'text',
        objects: [
          { emoji: '🪔', name: 'Gas Lamp', clue: '"In the Victorian era, gaslight was produced from what fossil fuel?" (also called coal gas)' },
          { emoji: '📰', name: 'Old Newspaper', clue: '"London, 1812 — Westminster Bridge illuminated by gas derived from ____."' },
          { emoji: '🔥', name: 'Fireplace', clue: 'A black rock that burns. Gas was distilled from it to light streets and homes.' }
        ],
        clues: ['A black fossil fuel', 'Gas was distilled from it', 'Think of what powered the Industrial Revolution'],
        hint: 'Victorian gaslight was produced from a common fossil fuel — a black rock that burns.',
        scoreValue: 150,
        inventoryReward: '🕯️',
        roomTheme: 'victorian-drawing'
      },
      {
        title: 'The Séance Room',
        description: 'A round table. Chairs pulled out as if guests fled mid-session. A Tarot deck is scattered. The door asks about the Major Arcana.',
        answer: '22',
        inputLabel: 'Cards in Major Arcana:',
        inputMaxLength: 2,
        inputPlaceholder: 'Number...',
        inputType: 'number',
        objects: [
          { emoji: '🃏', name: 'Tarot Deck', clue: '"How many cards are in the Tarot Major Arcana?" Count from The Fool to The World.' },
          { emoji: '🔮', name: 'Crystal Ball', clue: 'The Major Arcana: numbered 0 (Fool) through 21 (World). That is 22 cards total.' },
          { emoji: '📖', name: 'Occult Manual', clue: '"The 22 trumps of the Tarot: Fool, Magician, Priestess... Tower, Star, Moon, Sun, Judgement, World."' }
        ],
        clues: ['Count from 0 (Fool) to 21 (World)', 'It\'s a number in the twenties', 'Twenty-two trumps in the deck'],
        hint: 'The Major Arcana runs from card 0 (The Fool) to card 21 (The World).',
        scoreValue: 175,
        inventoryReward: '👻',
        roomTheme: 'victorian-seance'
      },
      {
        title: 'The Attic',
        description: 'Dusty portraits stare with moving eyes. A trunk is locked with a date — the year a legendary queen began her reign.',
        answer: '1837',
        inputLabel: 'Year of ascension:',
        inputMaxLength: 4,
        inputPlaceholder: 'Year...',
        inputType: 'number',
        objects: [
          { emoji: '👑', name: 'Crown Portrait', clue: '"What year did Queen Victoria ascend to the throne of the United Kingdom?"' },
          { emoji: '📜', name: 'Royal Decree', clue: '"Following the death of King William IV in June ____, Princess Victoria became Queen at age 18."' },
          { emoji: '🗝️', name: 'Ornate Key Slot', clue: 'The Victorian Era is named after her. She reigned from ____ to 1901.' }
        ],
        clues: ['She became queen after William IV died', 'She was 18 years old at the time', 'Begins with 18, ends before 1840'],
        hint: 'Victoria became queen at 18 after the death of William IV in the 1830s.',
        scoreValue: 200,
        inventoryReward: '📿',
        roomTheme: 'victorian-attic'
      },
      {
        title: 'The Crypt Exit',
        description: 'Beneath the mansion, a crypt door is carved with floral symbols. Name the flower of death in the Victorian language of flowers.',
        answer: 'lily',
        inputLabel: 'Flower of death:',
        inputMaxLength: 15,
        inputPlaceholder: 'Flower...',
        inputType: 'text',
        objects: [
          { emoji: '💐', name: 'Withered Bouquet', clue: '"In Victorian floriography, what white flower symbolizes death and the restored innocence of the departed?"' },
          { emoji: '⚰️', name: 'Coffin Carving', clue: 'A white trumpet-shaped flower placed on graves. Commonly seen at funerals to this day.' },
          { emoji: '📕', name: 'Language of Flowers Book', clue: '"The white ____ : symbol of purity, sympathy, and death. A funeral staple since the Victorian age."' }
        ],
        clues: ['A white funeral flower', 'Trumpet-shaped, placed on graves', 'Rhymes with "hilly"'],
        hint: 'A white trumpet-shaped flower commonly associated with funerals and sympathy.',
        scoreValue: 225,
        inventoryReward: '🔑',
        roomTheme: 'victorian-crypt'
      }
    ],
    stories: {
      intro:  ["The iron gate screeches. Blackwood Manor stands against a storm-lit sky.", "You entered seeking shelter. The door locked behind you.", "Portraits whisper. Floorboards creak where no one walks.", "Solve the mansion's mysteries before its ghosts claim you as their own."],
      room1:  ["The drawing room. Velvet curtains sway without wind.", "A gas lamp flickers — on, off, on — as if something breathes on it.", "The mantelpiece holds a riddle carved in the stone."],
      room2:  ["The séance room. Candles ignite by themselves as you enter.", "Chairs are arranged in a circle. One is still warm.", "A scattered Tarot deck holds the answer to your escape."],
      room3:  ["The attic. Dust swirls in moonlight through a cracked window.", "Portraits line the walls. Their eyes follow you. One blinks.", "A locked trunk vibrates, demanding a historical date."],
      room4:  ["Beneath the mansion. Stone steps descend into a crypt.", "Names on the walls. Dates. Some from centuries ago. Some from... yesterday.", "A floral riddle guards the only exit to the garden beyond."],
      victory:["The crypt door opens to pouring rain and blessed fresh air.", "You run through the garden. The mansion's windows glow behind you.", "The gate opens. As you pass through, every light in the manor extinguishes at once.", "Blackwood Manor may have released you... but it will remember you."],
      defeat: ["The candles all die. Absolute darkness.", "Cold hands on your shoulders. A voice: 'Stay.'", "Your portrait appears on the attic wall, eyes frozen wide.", "Another guest. Forever."]
    }
  },

  // ═══════════════════════════════════════════════
  //  SPACE STATION REACTOR MELTDOWN (PREMIUM) — 5 puzzles
  // ═══════════════════════════════════════════════
  spacestation: {
    name: 'Space Station Reactor Meltdown',
    icon: '🚀',
    time: 720,
    hints: 4,
    bodyClass: 'theme-spacestation',
    victoryMsg: n => `${n}, reactor stabilized! You saved the station and 200 souls aboard.`,
    defeatMsg:  n => `${n}, the reactor went critical. The station is a new star for 0.3 seconds.`,
    puzzles: [
      {
        title: 'Command Bridge',
        description: 'Alarms scream. Red lights bathe the bridge. The navigation computer requires planetary knowledge to unlock emergency protocols.',
        answer: 'mars',
        inputLabel: 'Name the planet:',
        inputMaxLength: 15,
        inputPlaceholder: 'Planet...',
        inputType: 'text',
        objects: [
          { emoji: '🖥️', name: 'Nav Computer', clue: '"Which planet in our solar system is known as the Red Planet?"' },
          { emoji: '🔴', name: 'Planet Hologram', clue: 'Fourth from the sun. Named after the Roman god of war. It has two moons.' },
          { emoji: '📡', name: 'Mission Briefing', clue: '"Olympus Mons. Valles Marineris. Curiosity and Perseverance explored this world."' }
        ],
        clues: ['Fourth planet from the Sun', 'Named after the Roman god of war', 'Rovers Curiosity and Perseverance are there'],
        hint: 'The "Red Planet" — fourth from the Sun, named after a Roman god.',
        scoreValue: 150,
        inventoryReward: '🪪',
        roomTheme: 'station-bridge'
      },
      {
        title: 'Reactor Core',
        description: 'The reactor core chamber. Temperature climbing. The cooling system needs a physics constant to reinitialize.',
        answer: '300000',
        inputLabel: 'Speed of light (km/s):',
        inputMaxLength: 7,
        inputPlaceholder: 'km/s...',
        inputType: 'number',
        objects: [
          { emoji: '⚡', name: 'Reactor Display', clue: '"What is the approximate speed of light in kilometers per second?" Round to the nearest thousand.' },
          { emoji: '📊', name: 'Physics Reference', clue: 'c ≈ 299,792 km/s. The system accepts rounded values. Think 300,000.' },
          { emoji: '🔬', name: 'Calibration Manual', clue: '"Light speed: approximately three hundred thousand km per second. Enter as a number."' }
        ],
        clues: ['About 299,792 km/s', 'Round to the nearest thousand', 'Three hundred thousand'],
        hint: 'The speed of light is approximately 300,000 km/s.',
        scoreValue: 200,
        inventoryReward: '❄️',
        roomTheme: 'station-core'
      },
      {
        title: 'Life Support Bay',
        description: 'The life support systems are failing. Reroute power by identifying a fundamental element on the periodic table.',
        answer: 'he',
        inputLabel: 'Chemical symbol:',
        inputMaxLength: 3,
        inputPlaceholder: 'Symbol...',
        inputType: 'text',
        objects: [
          { emoji: '🧪', name: 'Element Scanner', clue: '"What is the chemical symbol for Helium?" Two letters.' },
          { emoji: '🎈', name: 'Pressurized Tank', clue: 'Element 2 on the periodic table. A noble gas. Makes balloons float.' },
          { emoji: '☀️', name: 'Solar Spectrometer', clue: '"Named after Helios, the Sun. Discovered in solar spectra before found on Earth."' }
        ],
        clues: ['Element number 2', 'A noble gas, lighter than air', 'Named after the Greek sun god'],
        hint: 'Helium — element #2, named after the Greek sun god Helios.',
        scoreValue: 200,
        inventoryReward: '🫁',
        roomTheme: 'station-lifesupport'
      },
      {
        title: 'EVA Airlock',
        description: 'You need to spacewalk to reach the escape pods. The airlock quiz asks about our cosmic address.',
        answer: 'milky way',
        inputLabel: 'Name our galaxy:',
        inputMaxLength: 20,
        inputPlaceholder: 'Galaxy name...',
        inputType: 'text',
        objects: [
          { emoji: '🌌', name: 'Star Chart', clue: '"What is the name of the galaxy that contains our Solar System?"' },
          { emoji: '🔭', name: 'Telescope', clue: 'A barred spiral galaxy. You can see its band across the night sky. Named for its milky appearance.' },
          { emoji: '🗺️', name: 'Galaxy Map', clue: '"Our home galaxy: 100,000 light-years across. Named after the Latin via lactea."' }
        ],
        clues: ['You can see it as a band across the night sky', 'Named for its milky appearance', 'Two words: an adjective and a noun describing a path'],
        hint: 'Our galaxy is visible as a milky band across the night sky.',
        scoreValue: 225,
        inventoryReward: '🧑‍🚀',
        roomTheme: 'station-airlock'
      },
      {
        title: 'Escape Pod',
        description: 'The escape pod. One question between you and survival. The launch sequence needs current solar system data.',
        answer: '8',
        inputLabel: 'Number of planets:',
        inputMaxLength: 2,
        inputPlaceholder: 'Count...',
        inputType: 'number',
        objects: [
          { emoji: '🚀', name: 'Launch Console', clue: '"How many planets are in our solar system?" (Current IAU classification)' },
          { emoji: '📋', name: 'Planet Registry', clue: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Pluto was reclassified in 2006.' },
          { emoji: '🪐', name: 'Planet Model', clue: '"Since the IAU redefined \'planet\' in 2006, Pluto is a dwarf planet. Count the rest."' }
        ],
        clues: ['Pluto was demoted in 2006', 'Count from Mercury to Neptune', 'A single digit number'],
        hint: 'Count the planets from Mercury to Neptune (Pluto was reclassified).',
        scoreValue: 250,
        inventoryReward: '🔐',
        roomTheme: 'station-pod'
      }
    ],
    stories: {
      intro:  ["Red alert. The station shakes violently.", "\"Reactor containment failure. Meltdown in 12 minutes.\"", "200 crew depend on you reaching the emergency controls.", "Five sections. Five lockdowns. The clock is merciless."],
      room1:  ["The command bridge. Sparks rain from overhead.", "Officers are evacuating. The nav computer is locked.", "Unlock it to access the emergency reactor route."],
      room2:  ["The reactor core. Heat distorts the air.", "Radiation warnings flash. The cooling system needs recalibration.", "Get this wrong and the reactor goes critical."],
      room3:  ["Life support bay. The air is thinning.", "Power must be rerouted through the element identification system.", "Your lungs burn. Think clearly. Breathe shallow."],
      room4:  ["The EVA airlock. Beyond the glass: infinite void.", "Tether yourself and answer the navigation challenge.", "One wrong step and you drift forever."],
      room5:  ["The escape pod. Your salvation.", "The launch sequence has one final authentication.", "200 lives. One answer. No pressure."],
      victory:["The pod launches! The station recedes behind you.", "Minutes later, the reactor stabilizes remotely. The crew is safe.", "A rescue ship approaches. You watch the station — still intact — glow against the stars.", "Hero of Station Prometheus. They'll name a wing after you."],
      defeat: ["The reactor breaches containment.", "For 0.3 seconds, a new sun is born in low orbit.", "Station Prometheus becomes a footnote in space exploration history.", "200 souls. Gone in a flash of nuclear fire."]
    }
  },

  // ═══════════════════════════════════════════════
  //  ANCIENT TEMPLE OF ILLUSIONS — 4 puzzles
  // ═══════════════════════════════════════════════
  temple: {
    name: 'Ancient Temple of Illusions',
    icon: '🏛️',
    time: 660,
    hints: 4,
    bodyClass: 'theme-temple',
    victoryMsg: n => `${n}, you solved the temple's ancient riddles! The gods grant your freedom.`,
    defeatMsg:  n => `${n}, the temple sealed forever. Your name joins the carvings of the lost.`,
    puzzles: [
      {
        title: 'Hall of Mirrors',
        description: 'Infinite reflections surround you. The inscription reads backward. Decode the reversed message to understand its true meaning.',
        answer: 'reflection',
        inputLabel: 'What do mirrors show?',
        inputMaxLength: 20,
        inputPlaceholder: 'Answer...',
        inputType: 'text',
        objects: [
          { emoji: '🪞', name: 'Ancient Mirror', clue: '"noitcelfeR" — read it backward. What do mirrors show? What is this word reversed?' },
          { emoji: '✨', name: 'Light Beam', clue: 'The word backward: n-o-i-t-c-e-l-f-e-R. Now read it forward.' },
          { emoji: '👁️', name: 'All-Seeing Eye', clue: '"What you see in a mirror: your ________. The reversed text spells it."' }
        ],
        clues: ['Read "noitcelfeR" backward', 'It\'s what mirrors show you', 'R-e-f-l-e-c-t-i-o-n'],
        hint: 'The inscription "noitcelfeR" is a word spelled backward.',
        scoreValue: 175,
        inventoryReward: '🔮',
        roomTheme: 'temple-mirrors'
      },
      {
        title: 'The Sundial Altar',
        description: 'A massive sundial at the temple\'s center. The shadow alignment puzzle tests your directional knowledge.',
        answer: 'west',
        inputLabel: 'Direction:',
        inputMaxLength: 10,
        inputPlaceholder: 'Direction...',
        inputType: 'text',
        objects: [
          { emoji: '☀️', name: 'Sundial', clue: '"If the shadow points East, the sun must be in which direction?" (Think about how shadows work.)' },
          { emoji: '🧭', name: 'Ancient Compass', clue: 'Shadows fall opposite to the light source. East shadow = light from the...' },
          { emoji: '📐', name: 'Geometric Inscription', clue: '"Shadow and light are opposed. East is opposite of ____."' }
        ],
        clues: ['Shadows point away from the light', 'Opposite of East', 'Where the sun sets'],
        hint: 'Shadows point away from the light source. East is opposite to...',
        scoreValue: 175,
        inventoryReward: '🌅',
        roomTheme: 'temple-sundial'
      },
      {
        title: 'Statue Garden',
        description: 'Twelve guardian statues encircle a geometric altar. A dodecahedron rotates above it, demanding its secret.',
        answer: '12',
        inputLabel: 'Number of faces:',
        inputMaxLength: 3,
        inputPlaceholder: 'Faces...',
        inputType: 'number',
        objects: [
          { emoji: '🗿', name: 'Guardian Statue', clue: '"How many faces does a dodecahedron have?" Count the pentagonal sides.' },
          { emoji: '⬠', name: 'Floating Dodecahedron', clue: 'Dodeca = twelve in Greek. Hedron = face/surface. Twelve pentagonal faces.' },
          { emoji: '📖', name: 'Sacred Geometry Text', clue: '"The dodecahedron: 12 faces, 30 edges, 20 vertices. A Platonic solid of perfection."' }
        ],
        clues: ['"Dodeca" means twelve in Greek', 'It has pentagonal faces', 'Same as the number of months in a year'],
        hint: 'The prefix "dodeca-" comes from Greek, meaning twelve.',
        scoreValue: 200,
        inventoryReward: '💎',
        roomTheme: 'temple-statues'
      },
      {
        title: 'The Hidden Chamber',
        description: 'The final seal. Ancient glyphs depict one of the Seven Wonders. Name the wonder that stood in the great port city of Egypt.',
        answer: 'lighthouse',
        inputLabel: 'Name the wonder:',
        inputMaxLength: 20,
        inputPlaceholder: 'Wonder...',
        inputType: 'text',
        objects: [
          { emoji: '🏛️', name: 'Ancient Mural', clue: '"What ancient wonder was built on the island of Pharos in the harbor of Alexandria?"' },
          { emoji: '🔦', name: 'Eternal Flame', clue: 'A tall tower with a fire at its peak. Guided ships to harbor. One of the Seven Wonders.' },
          { emoji: '📜', name: 'Historical Scroll', clue: '"The Pharos of Alexandria — a towering __________ , the tallest structure of its age."' }
        ],
        clues: ['Built on the island of Pharos', 'Guided ships with a flame at its peak', 'A tall tower for navigation at sea'],
        hint: 'The Pharos of Alexandria was a tall tower that guided ships to harbor with fire.',
        scoreValue: 250,
        inventoryReward: '🗝️',
        roomTheme: 'temple-chamber'
      }
    ],
    stories: {
      intro:  ["The jungle parts. The temple rises — impossible, untouched by time.", "Ancient stones hum with a forgotten energy.", "Four trials of wisdom, perception, and knowledge.", "The temple offers escape to the worthy. The unworthy become part of its walls."],
      room1:  ["Mirrors. Infinite mirrors. Your reflection stares back from every angle.", "Not all reflections are the same. Look closer.", "An inscription shimmers backward in the glass."],
      room2:  ["Sunlight pierces through a hole in the ceiling.", "A massive sundial dominates the chamber. Shadows tell the truth.", "Understand the relationship between light and shadow."],
      room3:  ["Twelve statues. Twelve guardians. Twelve tests passed through millennia.", "A perfect geometric shape floats above the altar.", "Name its essence and the garden gates will open."],
      room4:  ["The hidden chamber. No one has been here in millennia.", "Murals depict ancient wonders. One is the key.", "Name it, and the temple releases you."],
      victory:["The temple doors open. Golden light floods the chamber.", "As you step out, the jungle reclaims the entrance behind you.", "The temple sinks back into legend, as if it was never there.", "But you carry its wisdom. And it will remember you."],
      defeat: ["The walls close in. Stone grinds against stone.", "Your torch gutters. The air grows heavy.", "Your face appears among the carvings — a new guardian for all time.", "The temple has claimed another seeker."]
    }
  },

  // ═══════════════════════════════════════════════
  //  DARK WEB HACKER VAULT (PREMIUM) — 4 puzzles
  // ═══════════════════════════════════════════════
  hackervault: {
    name: 'Dark Web Hacker Vault',
    icon: '💻',
    time: 540,
    hints: 3,
    bodyClass: 'theme-hackervault',
    victoryMsg: n => `${n}, you cracked the vault! Root access achieved. The dark web bows.`,
    defeatMsg:  n => `${n}, the vault's countermeasures triggered. Your identity is exposed. You're done.`,
    puzzles: [
      {
        title: 'Firewall Breach',
        description: 'The first layer of defense. A firewall authentication challenge asks about network fundamentals.',
        answer: '22',
        inputLabel: 'Default SSH port:',
        inputMaxLength: 5,
        inputPlaceholder: 'Port...',
        inputType: 'number',
        objects: [
          { emoji: '🔥', name: 'Firewall Interface', clue: '"What is the default port number for SSH (Secure Shell) connections?"' },
          { emoji: '📊', name: 'Port Scan Results', clue: 'Common ports: HTTP=80, HTTPS=443, FTP=21, SSH=??, SMTP=25.' },
          { emoji: '🔒', name: 'Auth Log', clue: '"Secure Shell daemon listening on port __. Used for encrypted remote access."' }
        ],
        clues: ['It\'s port 21 + 1', 'Comes right after FTP (port 21)', 'Between 20 and 25'],
        hint: 'SSH uses a well-known port number just above FTP\'s port 21.',
        scoreValue: 175,
        inventoryReward: '🔓',
        roomTheme: 'hacker-firewall'
      },
      {
        title: 'Encrypted Archive',
        description: 'An encrypted file archive. The decryption key lies in understanding a classical cipher — ROT13.',
        answer: 'hello',
        inputLabel: 'Decoded message:',
        inputMaxLength: 15,
        inputPlaceholder: 'Decoded...',
        inputType: 'text',
        objects: [
          { emoji: '🗂️', name: 'Encrypted File', clue: '"ROT13 cipher: URYYB. Decode this message." (Each letter shifted 13 positions.)' },
          { emoji: '🔐', name: 'Cipher Wheel', clue: 'ROT13: A↔N, B↔O, C↔P, ... H→U, E→R, L→Y, O→B. So URYYB = ?' },
          { emoji: '📝', name: 'Decryption Notes', clue: '"U→H, R→E, Y→L, Y→L, B→O. The decoded word is a common English greeting."' }
        ],
        clues: ['U→H, R→E in ROT13', 'Y→L in ROT13', 'A common 5-letter greeting'],
        hint: 'ROT13 shifts each letter by 13 positions. U→H, R→E, Y→L, Y→L, B→O.',
        scoreValue: 200,
        inventoryReward: '🗝️',
        roomTheme: 'hacker-archive'
      },
      {
        title: 'Neural Core',
        description: 'The vault\'s neural AI core. Bypass it with binary arithmetic knowledge.',
        answer: '1111',
        inputLabel: 'Binary result:',
        inputMaxLength: 8,
        inputPlaceholder: 'Binary...',
        inputType: 'text',
        objects: [
          { emoji: '🧠', name: 'Neural Core Display', clue: '"In binary arithmetic: 1010 + 0101 = ?" Add the binary numbers.' },
          { emoji: '💻', name: 'Binary Calculator', clue: '1010 = 10 in decimal. 0101 = 5 in decimal. 10 + 5 = 15. Now convert 15 to binary.' },
          { emoji: '📟', name: 'Debug Console', clue: '"15 in binary: 8+4+2+1 = 1111. Four ones."' }
        ],
        clues: ['Convert to decimal: 1010=10, 0101=5', '10 + 5 = 15 in decimal', '15 in binary is 1111'],
        hint: '1010 (decimal 10) + 0101 (decimal 5) = 15. Convert 15 back to binary.',
        scoreValue: 225,
        inventoryReward: '🔌',
        roomTheme: 'hacker-neural'
      },
      {
        title: 'The Root Access',
        description: 'The final terminal. Root access to the vault. One Unix command stands between you and total control.',
        answer: 'ls',
        inputLabel: 'Unix command:',
        inputMaxLength: 10,
        inputPlaceholder: 'Command...',
        inputType: 'text',
        objects: [
          { emoji: '💻', name: 'Root Terminal', clue: '"What Unix/Linux command lists files and directories?" Two letters.' },
          { emoji: '📂', name: 'File System', clue: 'The most basic file-listing command in Unix. Just two lowercase letters: l and s.' },
          { emoji: '📖', name: 'Man Page', clue: '"__ — list directory contents. Usage: __ [OPTION]... [FILE]..."' }
        ],
        clues: ['A two-letter command', 'Lists directory contents', 'First letter is L'],
        hint: 'The most fundamental Unix command for listing files — just two letters.',
        scoreValue: 250,
        inventoryReward: '🔐',
        roomTheme: 'hacker-root'
      }
    ],
    stories: {
      intro:  ["The deep web. Layer after layer of encryption.", "You've traced the most secure data vault on the dark web to this server.", "Four layers of defense. Four puzzles designed by the world's best hackers.", "Crack them all. Claim root access. Don't get caught."],
      room1:  ["Layer one: The firewall. Every packet is monitored.", "The authentication challenge glows green on your screen.", "Prove your network knowledge to slip past."],
      room2:  ["Layer two: Encrypted archive. 256-bit encryption.", "But the outer lock uses a classical cipher. Old school.", "Decode the message and the archive opens."],
      room3:  ["Layer three: The neural core. AI-driven defense.", "It speaks only in binary. To bypass it, think like a machine.", "Calculate precisely. Machines don't accept approximations."],
      room4:  ["Layer four: Root access. The final terminal.", "One command. The most basic command in Unix.", "Even the most complex vaults sometimes rely on simple keys."],
      victory:["Root access granted. The vault is yours.", "Terabytes of data stream across your screen.", "You copy what you need and wipe your traces.", "The dark web's best vault — cracked by you. Legend."],
      defeat: ["COUNTERMEASURE ACTIVATED. Trace initiated.", "Your VPN chain collapses. Your real IP exposed.", "Three-letter agencies now have your name.", "The vault wins. Game over, hacker."]
    }
  }
};

// ──────────── STATE ────────────
const STATE = {
  currentSection: 'home',
  gameActive: false,
  currentPuzzle: 1,
  totalPuzzles: 5,
  score: 0,
  hintsRemaining: 3,
  hintsUsed: 0,
  timerInterval: null,
  timeRemaining: 600,
  timeElapsed: 0,
  playerName: 'Anonymous',
  puzzlesSolved: 0,
  startTime: null,
  discoveredClues: {},
  sanity: 100,
  storyMode: true,
  storyQueue: [],
  storyCallback: null,
  selectedRoom: 'mansion',
  inventory: [],
  solvedPuzzles: new Set(),
  roomHistory: [],
  activeThemeKey: 'mansion',
  isMultiplayer: false,
  mpRoomCode: null
};

// Active references set during startGame()
let PUZZLES = {};    // numbered puzzle map for the active theme
let STORIES = {};    // story map for the active theme
let ACTIVE_THEME = null;

// ──────────── BADGE DEFINITIONS ────────────
const ALL_BADGES = [
  { id:'first_escape',  icon:'🏆', name:'First Escape',   desc:'Complete your first escape room' },
  { id:'no_hints',      icon:'🧠', name:'Mastermind',     desc:'Escape without using any hints' },
  { id:'speed_demon',   icon:'⚡', name:'Speed Demon',    desc:'Escape in under 3 minutes' },
  { id:'quick_escape',  icon:'🏃', name:'Quick Escape',   desc:'Escape in under 5 minutes' },
  { id:'perfect_clear', icon:'⭐', name:'Perfect Clear',  desc:'Solve all puzzles in one run' },
  { id:'high_scorer',   icon:'🔥', name:'High Scorer',    desc:'Score above 4500 in a single run' },
  { id:'explorer',      icon:'🔍', name:'Explorer',       desc:'Discover all clues in a single room' },
  { id:'survivor',      icon:'💀', name:'Survivor',       desc:'Complete the game with less than 60s remaining' },
  { id:'night_owl',     icon:'🦉', name:'Night Owl',      desc:'Play the game after midnight' },
  { id:'persistent',    icon:'💪', name:'Persistent',     desc:'Play the game 5 times' },
  { id:'clueless',      icon:'🤷', name:'Clueless',       desc:'Submit 10 wrong answers in one game' },
  { id:'brave',         icon:'🛡️', name:'Brave Soul',     desc:'Start the game in story mode' },
  { id:'collector',     icon:'🎒', name:'Collector',      desc:'Find all clue objects in one game' },
  { id:'sanity_check',  icon:'😱', name:'Sanity Check',   desc:'Finish with sanity below 30%' },
  { id:'untouchable',   icon:'👻', name:'Untouchable',    desc:'Solve a puzzle on first attempt' },
  { id:'five_timer',    icon:'🎮', name:'Veteran',        desc:'Escape 5 times total' },
  { id:'asylum_escape', icon:'🧟', name:'Discharged',     desc:'Escape the Abandoned Asylum' },
  { id:'catacomb_escape',icon:'⚰️',name:'Bone Walker',    desc:'Escape The Catacombs' },
  { id:'all_themes',    icon:'👑', name:'Master Escapist', desc:'Escape all three themes' },
  { id:'quantum_escape', icon:'⏳', name:'Time Breaker',   desc:'Escape the Quantum Time Loop' },
  { id:'cyberpunk_escape',icon:'🌃',name:'Netrunner',      desc:'Escape the Cyberpunk Neon District' },
  { id:'underwater_escape',icon:'🌊',name:'Deep Diver',    desc:'Escape the Underwater Research Base' },
  { id:'victorian_escape',icon:'🏚️',name:'Ghost Walker',   desc:'Escape the Haunted Victorian Mansion' },
  { id:'station_escape', icon:'🚀', name:'Void Survivor',  desc:'Escape the Space Station Reactor Meltdown' },
  { id:'temple_escape',  icon:'🏛️', name:'Temple Sage',    desc:'Escape the Ancient Temple of Illusions' },
  { id:'hacker_escape',  icon:'💻', name:'Root Access',    desc:'Escape the Dark Web Hacker Vault' },
  { id:'all_ten_themes', icon:'🌟', name:'Legendary Escapist', desc:'Escape all ten themes' }
];

let wrongAnswerCount = 0;
let firstAttemptPuzzles = new Set();

// ═══════════════════════════════════════════════════════
// DYNAMIC ROOM GENERATION
// ═══════════════════════════════════════════════════════

function generatePuzzleRooms(themeKey) {
  const theme = THEME_DATA[themeKey];
  if (!theme) return;

  const container = document.getElementById('roomContentOverlay');
  container.innerHTML = '';

  theme.puzzles.forEach((p, idx) => {
    const num = idx + 1;
    const isActive = num === 1 ? ' active' : '';

    // Build objects HTML (support both old {key,icon,name} and new {emoji,name,clue} formats)
    const objectsHTML = p.objects.map(obj => {
      const objKey = obj.key || obj.name.toLowerCase().replace(/[^a-z0-9]/g,'_');
      const objIcon = obj.icon || obj.emoji || '❓';
      return `<div class="room-object clickable draggable horror-object" onclick="showClue(${num},'${objKey}')" data-clue="${objKey}" data-puzzle="${num}">
        <div class="object-visual horror-obj-icon">${objIcon}</div>
        <span>${obj.name}</span>
        <div class="object-glow"></div>
      </div>`;
    }).join('');

    // Build answer area based on inputType
    let answerAreaHTML = '';
    if (p.inputType === 'notes') {
      answerAreaHTML = `
        <div class="answer-area">
          <label>${p.inputLabel}</label>
          <div class="note-buttons" id="noteButtons${num}">
            <button class="note-btn horror-note" onclick="addNote(${num},'C')">C</button>
            <button class="note-btn horror-note" onclick="addNote(${num},'D')">D</button>
            <button class="note-btn horror-note" onclick="addNote(${num},'E')">E</button>
            <button class="note-btn horror-note" onclick="addNote(${num},'F')">F</button>
            <button class="note-btn horror-note" onclick="addNote(${num},'G')">G</button>
            <button class="note-btn horror-note" onclick="addNote(${num},'A')">A</button>
            <button class="note-btn horror-note" onclick="addNote(${num},'B')">B</button>
            <button class="note-btn clear-btn" onclick="clearNotes(${num})">✕</button>
          </div>
          <div class="answer-input-group">
            <input type="text" id="answer${num}" class="answer-input horror-input" maxlength="${p.inputMaxLength}" placeholder="${p.inputPlaceholder}" readonly autocomplete="off" />
            <button class="btn btn-blood" onclick="submitAnswer(${num})">Submit</button>
            <button class="btn btn-hint horror-hint" onclick="useHint(${num})">💡 Hint</button>
          </div>
          <div class="answer-feedback" id="feedback${num}"></div>
        </div>`;
    } else {
      answerAreaHTML = `
        <div class="answer-area">
          <label>${p.inputLabel}</label>
          <div class="answer-input-group">
            <input type="text" id="answer${num}" class="answer-input horror-input" maxlength="${p.inputMaxLength}" placeholder="${p.inputPlaceholder}" autocomplete="off" />
            <button class="btn btn-blood" onclick="submitAnswer(${num})">Submit</button>
            <button class="btn btn-hint horror-hint" onclick="useHint(${num})">💡 Hint</button>
          </div>
          <div class="answer-feedback" id="feedback${num}"></div>
        </div>`;
    }

    const roomHTML = `
      <div class="puzzle-room${isActive}" id="puzzle${num}">
        <div class="room-scene horror-scene">
          <div class="room-title horror-room-title">${p.title}</div>
          <div class="room-description horror-desc"><p>${p.description}</p></div>
          <div class="room-objects" id="objects${num}">${objectsHTML}</div>
          <div class="clue-panel horror-clue-panel" id="cluePanel${num}">
            <div class="clue-text" id="clueText${num}">🔍 Investigate the objects to uncover clues...</div>
          </div>
          ${answerAreaHTML}
        </div>
      </div>`;

    container.insertAdjacentHTML('beforeend', roomHTML);
  });
}

function buildPuzzleMap(themeKey) {
  const theme = THEME_DATA[themeKey];
  const map = {};
  theme.puzzles.forEach((p, i) => {
    // Build clues map — support both old {key:text} object and new [{clue:'...'}] array formats
    let cluesMap;
    if (Array.isArray(p.clues) || !p.clues) {
      // New format: clues are inline in each object's .clue property
      cluesMap = {};
      p.objects.forEach(obj => {
        const key = obj.key || obj.name.toLowerCase().replace(/[^a-z0-9]/g,'_');
        cluesMap[key] = { text: obj.clue || '' };
      });
    } else {
      // Old format: clues is {key: text}
      cluesMap = Object.fromEntries(Object.entries(p.clues).map(([k,v]) => [k, {text:v}]));
    }
    // Normalize roomTheme — support both object and string formats
    let normalizedRoomTheme = p.roomTheme;
    if (typeof p.roomTheme === 'string' || !p.roomTheme) {
      normalizedRoomTheme = { wallColor:'rgba(20,15,25,0.95)', lightColor:'rgba(100,80,160,0.06)' };
    }
    map[i + 1] = {
      answer: p.answer,
      clues: cluesMap,
      hint: p.hint,
      scoreValue: p.scoreValue,
      inventoryReward: p.inventoryReward,
      roomTheme: normalizedRoomTheme
    };
  });
  return map;
}

// ═══════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════

function initLoadingScreen() {
  const bar = document.getElementById('loadingBar');
  const text = document.getElementById('loadingText');
  const msgs = ['Summoning spirits...','Dimming the lights...','Loading nightmares...','Preparing puzzles...','Opening the door...','Something stirs...','Almost ready...','Enter at your own risk...'];
  let prog = 0;
  const iv = setInterval(() => {
    prog += Math.random()*15+5;
    if (prog > 100) prog = 100;
    bar.style.width = prog+'%';
    text.textContent = msgs[Math.floor((prog/100)*(msgs.length-1))];
    if (prog >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('fade-out');
        setTimeout(() => document.getElementById('loadingScreen').style.display='none', 800);
      }, 500);
    }
  }, 300);
}

// ═══════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════

function navigateTo(section) {
  AudioEngine.click();
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const t = document.getElementById(section);
  if (t) t.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section===section));
  STATE.currentSection = section;
  if (section==='leaderboard') renderLeaderboard();
  if (section==='forum') renderForumPosts();
  if (section==='badges') renderBadgePage();
  if (section==='dashboard') renderDashboard();
  if (section==='profile') renderProfile();
  if (section==='multiplayer') { renderRoomsList(); if (MP_STATE.currentRoom) { showRoomView(); syncRoomState(); startMPSync(); } else { showLobbyView(); } }
  window.scrollTo({top:0,behavior:'smooth'});
}
function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('show'); }
function toggleSound() { const en=AudioEngine.toggle(); document.getElementById('soundToggle').textContent=en?'🔊':'🔇'; }

// ═══════════════════════════════════════════════════════
// PURCHASE / UNLOCK SYSTEM
// ═══════════════════════════════════════════════════════

const SHOP = {
  asylum:      { price: '$4.99', icon: '🧟', name: 'Abandoned Asylum',     desc: 'Flickering lights. Padded cells. The patients never left.', rooms: 7, tier: 'PREMIUM' },
  catacombs:   { price: '$9.99', icon: '💀', name: 'The Catacombs',        desc: 'Six million bones line the tunnels beneath Paris.', rooms: 10, tier: 'ULTIMATE' },
  quantum:     { price: '$6.99', icon: '⏳', name: 'Quantum Time Loop',    desc: 'A recursive time loop traps you between collapsing realities.', rooms: 4, tier: 'PREMIUM' },
  cyberpunk:   { price: '$4.99', icon: '🌃', name: 'Cyberpunk Neon District', desc: 'Neon-drenched alleys hide dark secrets in a dystopian city.', rooms: 4, tier: 'PREMIUM' },
  underwater:  { price: '$4.99', icon: '🌊', name: 'Underwater Research Base', desc: 'Pressure rising. Oxygen dropping. Something stirs in the deep.', rooms: 4, tier: 'PREMIUM' },
  victorian:   { price: '$9.99', icon: '🏚️', name: 'Haunted Victorian Mansion', desc: 'Creaking floors, whispering walls. The Victorians left more than furniture.', rooms: 4, tier: 'ULTIMATE' },
  spacestation:{ price: '$7.99', icon: '🚀', name: 'Space Station Reactor', desc: 'Reactor meltdown in 12 minutes. 200 lives depend on you.', rooms: 5, tier: 'PREMIUM' },
  temple:      { price: '$9.99', icon: '🏛️', name: 'Ancient Temple of Illusions', desc: 'The ancients left traps for the unworthy. Prove yourself or perish.', rooms: 4, tier: 'ULTIMATE' },
  hackervault: { price: '$8.99', icon: '💻', name: 'Dark Web Hacker Vault', desc: 'Four layers of defense. Crack the most secure vault on the dark web.', rooms: 4, tier: 'ULTIMATE' }
};

let pendingPurchaseTheme = null;

function getUnlockedThemes() {
  const user = getCurrentUser();
  if (!user) return ['mansion']; // not logged in — only free tier
  const key = `escaperoom_unlocked_${user.toLowerCase()}`;
  try { return JSON.parse(localStorage.getItem(key)) || ['mansion']; }
  catch { return ['mansion']; }
}
function saveUnlockedThemes(t) {
  const user = getCurrentUser();
  if (!user) return;
  const key = `escaperoom_unlocked_${user.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(t));
}

function isThemeUnlocked(theme) { return getUnlockedThemes().includes(theme); }

function refreshLockOverlays() {
  Object.keys(SHOP).forEach(theme => {
    const overlay = document.getElementById(`lock-${theme}`);
    const card = document.getElementById(`card-${theme}`);
    if (!overlay || !card) return;
    const badge = card.querySelector('.badge');
    if (isThemeUnlocked(theme)) {
      overlay.classList.add('unlocked');
      card.classList.remove('locked-card');
      if (badge) badge.textContent = (SHOP[theme].tier || 'PREMIUM') + ' ✓';
    } else {
      overlay.classList.remove('unlocked');
      card.classList.add('locked-card');
      if (badge) badge.textContent = (SHOP[theme].tier || 'PREMIUM') + ' — ' + SHOP[theme].price;
    }
  });
}

function handleRoomClick(room) {
  AudioEngine.init(); AudioEngine.resume(); AudioEngine.click();
  const freeThemes = ['mansion'];
  if (freeThemes.includes(room) || isThemeUnlocked(room)) {
    selectRoom(room);
  } else {
    // Find which tier this room belongs to and prompt to buy that pack
    const tier = getRoomTier(room);
    if (tier) {
      purchaseTier(tier);
    } else {
      showToast('🔒 This room requires a package purchase to unlock.', 'warning');
    }
  }
}

function getRoomTier(room) {
  for (const [tierKey, tierData] of Object.entries(TIER_DATA)) {
    if (tierData.rooms.includes(room)) return tierKey;
  }
  return null;
}

function openPurchaseModal(theme) {
  const shop = SHOP[theme];
  if (!shop) return;
  pendingPurchaseTheme = theme;
  document.getElementById('purchaseIcon').textContent = shop.icon;
  document.getElementById('purchaseTitle').textContent = `Unlock ${shop.name}`;
  document.getElementById('purchaseDesc').textContent = shop.desc;
  document.getElementById('purchaseRooms').textContent = shop.rooms;
  document.getElementById('purchasePrice').textContent = shop.price;
  document.getElementById('purchaseModal').classList.remove('hidden');
}

function closePurchaseModal() {
  AudioEngine.click();
  document.getElementById('purchaseModal').classList.add('hidden');
  pendingPurchaseTheme = null;
}

function confirmPurchase() {
  if (!pendingPurchaseTheme) return;
  AudioEngine.achievement();

  const theme = pendingPurchaseTheme;
  const btn = document.getElementById('purchaseBtn');

  // Simulate payment processing
  btn.disabled = true;
  btn.innerHTML = '⏳ Processing...';

  setTimeout(() => {
    // Unlock the theme
    const unlocked = getUnlockedThemes();
    if (!unlocked.includes(theme)) {
      unlocked.push(theme);
      saveUnlockedThemes(unlocked);
    }

    // Visual feedback
    btn.innerHTML = '✅ Unlocked!';
    btn.style.background = 'linear-gradient(135deg, #2e7d32, #43a047)';

    // Animate the card
    const card = document.getElementById(`card-${theme}`);
    if (card) card.classList.add('unlock-burst');

    refreshLockOverlays();

    setTimeout(() => {
      closePurchaseModal();
      btn.disabled = false;
      btn.innerHTML = '🛒 Purchase & Unlock';
      btn.style.background = '';
      if (card) card.classList.remove('unlock-burst');

      // Auto-navigate to the newly unlocked room
      selectRoom(theme);
    }, 1200);
  }, 1500);
}

// ═══════════════════════════════════════════════════════
// TIER-BASED PURCHASING (Possessed / Undead)
// ═══════════════════════════════════════════════════════

const TIER_DATA = {
  possessed: {
    name: 'Possessed',
    icon: '🩸',
    price: '$4.99',
    desc: 'Sell your soul and unlock the premium horror collection. More rooms, more terror, no escape.',
    rooms: ['asylum', 'quantum', 'cyberpunk', 'underwater'],
    features: [
      '✓ Abandoned Asylum (7 rooms)',
      '✓ Quantum Time Loop (4 rooms)',
      '✓ Cyberpunk Neon District (4 rooms)',
      '✓ Underwater Research Base (4 rooms)',
      '✓ Story mode & Badge collection',
      '✓ Sound effects pack'
    ]
  },
  undead: {
    name: 'Undead',
    icon: '💀',
    price: '$9.99',
    desc: 'Rise from the grave with access to the deadliest nightmares. 5 exclusive rooms of pure terror.',
    rooms: ['catacombs', 'victorian', 'spacestation', 'temple', 'hackervault'],
    features: [
      '✓ The Catacombs (10 rooms)',
      '✓ Haunted Victorian Mansion (4 rooms)',
      '✓ Space Station Reactor (5 rooms)',
      '✓ Ancient Temple of Illusions (4 rooms)',
      '✓ Dark Web Hacker Vault (4 rooms)',
      '✓ Custom avatar & Hint tokens'
    ]
  }
};

let pendingTier = null;

function purchaseTier(tier) {
  AudioEngine.init(); AudioEngine.resume(); AudioEngine.click();
  const data = TIER_DATA[tier];
  if (!data) return;

  // Check if tier already purchased
  const unlocked = getUnlockedThemes();
  const allAlreadyUnlocked = data.rooms.every(r => unlocked.includes(r));
  if (allAlreadyUnlocked) {
    showToast(`✅ You already own the ${data.name} tier!`, 'success');
    return;
  }

  pendingTier = tier;
  document.getElementById('tierIcon').textContent = data.icon;
  document.getElementById('tierTitle').textContent = `Upgrade to ${data.name}`;
  document.getElementById('tierDesc').textContent = data.desc;
  document.getElementById('tierPrice').textContent = data.price;

  const featuresEl = document.getElementById('tierFeatures');
  featuresEl.innerHTML = data.features.map(f => `<div class="purchase-feature">${f}</div>`).join('');

  // Reset button state
  const btn = document.getElementById('tierPurchaseBtn');
  btn.disabled = false;
  btn.innerHTML = '🛒 Purchase & Unlock All';
  btn.style.background = '';

  document.getElementById('tierModal').classList.remove('hidden');
}

function closeTierModal() {
  AudioEngine.click();
  document.getElementById('tierModal').classList.add('hidden');
  pendingTier = null;
}

function confirmTierPurchase() {
  if (!pendingTier) return;
  AudioEngine.achievement();

  const tier = pendingTier;
  const data = TIER_DATA[tier];
  const btn = document.getElementById('tierPurchaseBtn');

  // Simulate payment processing
  btn.disabled = true;
  btn.innerHTML = '⏳ Processing payment...';

  setTimeout(() => {
    // Unlock all rooms in this tier
    const unlocked = getUnlockedThemes();
    let newlyUnlocked = [];
    data.rooms.forEach(room => {
      if (!unlocked.includes(room)) {
        unlocked.push(room);
        newlyUnlocked.push(room);
      }
    });
    saveUnlockedThemes(unlocked);

    // Save tier purchase to user profile
    const user = getCurrentUser();
    const profile = getUserProfile(user);
    if (profile) {
      profile.purchasedTier = tier;
      if (tier === 'undead') profile.purchasedTier = 'undead';
      profile.coins = (profile.coins || 0) + (tier === 'undead' ? 300 : 150);
      saveUserProfile(user, profile);
      addActivity(user, `🛒 Purchased ${data.name} tier`);
    }

    // Visual feedback
    btn.innerHTML = '✅ All Rooms Unlocked!';
    btn.style.background = 'linear-gradient(135deg, #2e7d32, #43a047)';

    // Animate newly unlocked cards
    newlyUnlocked.forEach(room => {
      const card = document.getElementById(`card-${room}`);
      if (card) card.classList.add('unlock-burst');
    });

    refreshLockOverlays();
    updatePricingButtons();

    setTimeout(() => {
      closeTierModal();
      // Clean up animations
      newlyUnlocked.forEach(room => {
        const card = document.getElementById(`card-${room}`);
        if (card) card.classList.remove('unlock-burst');
      });
      // Update UI
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof updateNavUserInfo === 'function') updateNavUserInfo();
      showToast(`🎉 ${data.name} tier unlocked! ${newlyUnlocked.length} new rooms available!`, 'success');
    }, 1500);
  }, 2000);
}

function updatePricingButtons() {
  const unlocked = getUnlockedThemes();

  // Check Possessed tier
  const possessedRooms = TIER_DATA.possessed.rooms;
  const possessedOwned = possessedRooms.every(r => unlocked.includes(r));
  const possBtn = document.getElementById('possessedTierBtn');
  if (possBtn) {
    if (possessedOwned) {
      possBtn.textContent = '✅ Owned';
      possBtn.classList.add('btn-owned');
    } else {
      possBtn.textContent = 'Sell Your Soul';
      possBtn.classList.remove('btn-owned');
      possBtn.disabled = false;
    }
  }

  // Check Undead tier
  const undeadRooms = TIER_DATA.undead.rooms;
  const undeadOwned = undeadRooms.every(r => unlocked.includes(r));
  const undBtn = document.getElementById('undeadTierBtn');
  if (undBtn) {
    if (undeadOwned) {
      undBtn.textContent = '✅ Owned';
      undBtn.classList.add('btn-owned');
    } else {
      undBtn.textContent = 'Rise Again';
      undBtn.classList.remove('btn-owned');
      undBtn.disabled = false;
    }
  }
}

// ═══════════════════════════════════════════════════════
// ROOM SELECTION
// ═══════════════════════════════════════════════════════

function selectRoom(room) {
  AudioEngine.click();
  STATE.selectedRoom = room;
  const td = THEME_DATA[room];
  if (td) {
    document.getElementById('lobbyTitle').textContent = `${td.icon} ${td.name}`;
    document.getElementById('lobbyDesc').textContent = td.stories.intro.join(' ');
    document.getElementById('lobbyRooms').textContent = td.puzzles.length;
    document.getElementById('lobbyDiff').textContent = ({
      mansion:'Beginner', asylum:'Intermediate', catacombs:'Expert',
      quantum:'Hard', cyberpunk:'Intermediate', underwater:'Hard',
      victorian:'Intermediate', spacestation:'Expert', temple:'Intermediate', hackervault:'Expert'
    })[room] || 'Unknown';
    document.getElementById('lobbyTime').textContent = formatTime(td.time);
  }
  // Ensure correct sub-view state
  document.getElementById('gameLobby').classList.remove('hidden');
  document.getElementById('gameArea').classList.add('hidden');
  document.getElementById('gameResult').classList.add('hidden');
  document.getElementById('inventoryBar').classList.add('hidden');
  navigateTo('play');
}

// ═══════════════════════════════════════════════════════
// STORY MODE
// ═══════════════════════════════════════════════════════

function showStory(storyKey, callback) {
  if (!STATE.storyMode) { if (callback) callback(); return; }
  const narration = (STORIES && STORIES[storyKey]) ? STORIES[storyKey] : [];
  if (!narration.length) { if (callback) callback(); return; }

  STATE.storyQueue = [...narration];
  STATE.storyCallback = callback;
  document.getElementById('storyOverlay').classList.remove('hidden');
  document.getElementById('storyText').textContent = '';
  AudioEngine.whisper();
  typewriterEffect(document.getElementById('storyText'), STATE.storyQueue.shift());
}

function advanceStory() {
  AudioEngine.click();
  const el = document.getElementById('storyText');
  if (STATE.storyQueue.length) {
    el.textContent = ''; AudioEngine.whisper();
    typewriterEffect(el, STATE.storyQueue.shift());
  } else {
    document.getElementById('storyOverlay').classList.add('hidden');
    if (STATE.storyCallback) { STATE.storyCallback(); STATE.storyCallback = null; }
  }
}

function typewriterEffect(el, text, speed=35) {
  let i=0; el.textContent='';
  const t=()=>{ if(i<text.length){ el.textContent+=text.charAt(i); i++; setTimeout(t,speed); } };
  t();
}

// ═══════════════════════════════════════════════════════
// GAME START
// ═══════════════════════════════════════════════════════

function startGame() {
  try { AudioEngine.init(); AudioEngine.resume(); } catch(e) {}

  const themeKey = STATE.selectedRoom;
  const theme = THEME_DATA[themeKey];
  if (!theme) { console.error('No theme data for:', themeKey); return; }

  ACTIVE_THEME = theme;
  STATE.activeThemeKey = themeKey;
  STATE.totalPuzzles = theme.puzzles.length;
  // Always use logged-in username if available, fall back to typed name or Anonymous
  STATE.playerName = getCurrentUser() || document.getElementById('playerName').value.trim() || 'Anonymous';
  STATE.gameActive = true;
  STATE.currentPuzzle = 1;
  STATE.score = 0;
  STATE.hintsRemaining = theme.hints;
  STATE.hintsUsed = 0;
  STATE.timeRemaining = theme.time;
  STATE.timeElapsed = 0;
  STATE.puzzlesSolved = 0;
  STATE.startTime = Date.now();
  STATE.discoveredClues = {};
  STATE.sanity = 100;
  STATE.storyMode = document.getElementById('storyModeToggle').checked;
  STATE.inventory = [];
  STATE.solvedPuzzles = new Set();
  STATE.roomHistory = [1];
  wrongAnswerCount = 0;
  firstAttemptPuzzles = new Set(Array.from({length:STATE.totalPuzzles},(_,i)=>i+1));

  // Build puzzle & story maps
  PUZZLES = buildPuzzleMap(themeKey);
  STORIES = theme.stories;

  // Generate puzzle room HTML
  generatePuzzleRooms(themeKey);

  // Apply theme class to body
  document.body.classList.remove('theme-mansion','theme-asylum','theme-catacombs','theme-quantum','theme-cyberpunk','theme-underwater','theme-victorian','theme-spacestation','theme-temple','theme-hackervault');
  document.body.classList.add(theme.bodyClass);

  // Badges
  if (STATE.storyMode) awardBadge('brave');
  const h = new Date().getHours();
  if (h >= 0 && h < 5) awardBadge('night_owl');
  const _pcKey = 'escaperoom_playcount_' + (getCurrentUser()||'guest').toLowerCase();
  let pc = parseInt(localStorage.getItem(_pcKey)||'0');
  pc++; localStorage.setItem(_pcKey, pc.toString());
  if (pc >= 5) awardBadge('persistent');

  // Reset inventory UI
  resetInventoryUI();

  // Show game area
  document.getElementById('gameLobby').classList.add('hidden');
  document.getElementById('gameArea').classList.remove('hidden');
  document.getElementById('gameResult').classList.add('hidden');
  document.getElementById('inventoryBar').classList.remove('hidden');

  try { showPuzzle(1); } catch(e) { console.error('showPuzzle failed:', e); }
  try { buildProgressDots(); } catch(e) { console.error('buildProgressDots failed:', e); }
  updateHUD();
  updateSanityBar();
  try { update3DRoom(1); } catch(e) { console.error('update3DRoom failed:', e); }
  try { createDustParticles(); } catch(e) { console.error('createDustParticles failed:', e); }

  // Bind Enter keys for text inputs
  for (let i = 1; i <= STATE.totalPuzzles; i++) {
    const inp = document.getElementById(`answer${i}`);
    if (inp && !inp.readOnly) {
      inp.addEventListener('keydown', (e) => { if (e.key==='Enter') submitAnswer(i); });
    }
  }

  // Start ambient sound with theme
  try { AudioEngine.startAmbient(themeKey); } catch(e) { console.error('AudioEngine.startAmbient failed:', e); }

  // Initialize room-specific mechanics (oxygen bar, temperature, etc.)
  try { if (typeof ROOM_MECHANICS !== 'undefined') ROOM_MECHANICS.initRoomLogic(themeKey); } catch(e) { console.error('ROOM_MECHANICS init failed:', e); }

  // Initialize advanced game FX
  try { GameFX.init(); } catch(e) { console.error('GameFX.init failed:', e); }

  // Start random ambient jumpscares
  try { JumpscareEngine.startRandomScares(); } catch(e) { console.error('JumpscareEngine start failed:', e); }

  // START TIMER IMMEDIATELY — timer runs during story mode too
  startTimer();
  updateTimerDisplay();

  // Story intro (plays over the running game)
  showStory('intro', () => {
    showStory('room1', () => { try { AudioEngine.doorCreak(); } catch(e){} });
  });
}

function restartGame() {
  GameFX.cleanup();
  JumpscareEngine.stopRandomScares();
  document.getElementById('gameLobby').classList.remove('hidden');
  document.getElementById('gameArea').classList.add('hidden');
  document.getElementById('gameResult').classList.add('hidden');
  document.getElementById('inventoryBar').classList.add('hidden');
  document.body.classList.remove('theme-mansion','theme-asylum','theme-catacombs','theme-quantum','theme-cyberpunk','theme-underwater','theme-victorian','theme-spacestation','theme-temple','theme-hackervault');
  document.body.classList.remove('flicker-effect','high-dread','time-glitch');
  stopTimer(); AudioEngine.stopAmbient(); STATE.gameActive = false;
  if (typeof ROOM_MECHANICS !== 'undefined') ROOM_MECHANICS.cleanupRoom();
}

function exitGame() {
  GameFX.cleanup();
  JumpscareEngine.stopRandomScares();
  stopTimer(); AudioEngine.stopAmbient(); STATE.gameActive = false;
  if (typeof ROOM_MECHANICS !== 'undefined') ROOM_MECHANICS.cleanupRoom();
  document.getElementById('gameArea').classList.add('hidden');
  document.getElementById('gameResult').classList.add('hidden');
  document.getElementById('gameLobby').classList.remove('hidden');
  document.getElementById('inventoryBar').classList.add('hidden');
  document.getElementById('gameConfirmBar').classList.add('hidden');
  document.body.classList.remove('theme-mansion','theme-asylum','theme-catacombs','theme-quantum','theme-cyberpunk','theme-underwater','theme-victorian','theme-spacestation','theme-temple','theme-hackervault');
  document.body.classList.remove('flicker-effect','high-dread','time-glitch');
  navigateTo('home');
}

// ── Confirmation Bar (top of game area) ──
let _confirmAction = null;

function confirmExitGame() {
  _confirmAction = 'exit';
  document.getElementById('confirmBarIcon').textContent = '🚪';
  document.getElementById('confirmBarText').textContent = 'Exit game? All progress will be lost.';
  document.getElementById('confirmBarYes').textContent = '🚪 Exit';
  document.getElementById('gameConfirmBar').classList.remove('hidden');
}

function confirmRestartGame() {
  _confirmAction = 'restart';
  document.getElementById('confirmBarIcon').textContent = '🔄';
  document.getElementById('confirmBarText').textContent = 'Restart? All progress will be lost.';
  document.getElementById('confirmBarYes').textContent = '🔄 Restart';
  document.getElementById('gameConfirmBar').classList.remove('hidden');
}

function confirmYes() {
  const action = _confirmAction;
  closeConfirmBar();
  if (action === 'exit') exitGame();
  else if (action === 'restart') { restartGame(); startGame(); }
}

function closeConfirmBar() {
  document.getElementById('gameConfirmBar').classList.add('hidden');
  _confirmAction = null;
}

// ═══════════════════════════════════════════════════════
// TIMER
// ═══════════════════════════════════════════════════════

function startTimer() {
  stopTimer();
  STATE._jumpscareAt60 = false;
  STATE._jumpscareAt30 = false;
  STATE.timerInterval = setInterval(() => {
    try {
      if (STATE.timeRemaining <= 0) { endGame(false); return; }
      STATE.timeRemaining--; STATE.timeElapsed++;
      updateTimerDisplay();
      if (STATE.timeRemaining%60===0 && STATE.timeRemaining>0) { AudioEngine.horror(); reduceSanity(5); try { CameraShake.shake('normal'); } catch(e){} }
      if (STATE.timeRemaining<=60 && STATE.timeRemaining%2===0) AudioEngine.heartbeat();
      // Jumpscare at 60 seconds remaining
      if (STATE.timeRemaining === 60 && !STATE._jumpscareAt60) {
        STATE._jumpscareAt60 = true;
        try { JumpscareEngine.trigger(STATE.activeThemeKey, { shake: 'heavy', duration: 1500 }); } catch(e){}
      }
      // Jumpscare at 30 seconds — more intense
      if (STATE.timeRemaining === 30 && !STATE._jumpscareAt30) {
        STATE._jumpscareAt30 = true;
        try { JumpscareEngine.trigger(STATE.activeThemeKey, { shake: 'violent', duration: 2000 }); } catch(e){}
      }
      // Continuous shake in final 15 seconds
      if (STATE.timeRemaining <= 15 && STATE.timeRemaining > 0 && STATE.timeRemaining % 3 === 0) {
        try { CameraShake.shake('light'); } catch(e){}
      }
      if (Math.random()<0.005) triggerLightning();
    } catch(e) {
      console.error('Timer tick error:', e);
    }
  }, 1000);
}
function stopTimer() { if(STATE.timerInterval){ clearInterval(STATE.timerInterval); STATE.timerInterval=null; } }

function updateTimerDisplay() {
  const m=Math.floor(STATE.timeRemaining/60), s=STATE.timeRemaining%60;
  const timerEl = document.getElementById('hudTimer');
  if (timerEl) timerEl.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const th=document.querySelector('.timer-hud');
  if (th) {
    if(STATE.timeRemaining<60) th.classList.add('danger'); else th.classList.remove('danger');
  }
}
function formatTime(sec) { const m=Math.floor(sec/60),s=sec%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }

// ═══════════════════════════════════════════════════════
// SANITY
// ═══════════════════════════════════════════════════════

function reduceSanity(a) {
  STATE.sanity=Math.max(0,STATE.sanity-a); updateSanityBar();
  try {
    if(STATE.sanity<15){
      CameraShake.shake('heavy');
    } else if(STATE.sanity<30){
      CameraShake.shake('normal');
    }
  } catch(e){}
}
function restoreSanity(a) { STATE.sanity=Math.min(100,STATE.sanity+a); updateSanityBar(); }
function updateSanityBar() { const f=document.getElementById('sanityFill'); if(f) f.style.width=STATE.sanity+'%'; if(typeof GameFX!=='undefined') GameFX.updateVignette(STATE.sanity); }

// ═══════════════════════════════════════════════════════
// HUD / PROGRESS
// ═══════════════════════════════════════════════════════

function updateHUD() {
  const el = id => document.getElementById(id);
  const lvl = el('hudLevel'); if(lvl) lvl.textContent=`${STATE.currentPuzzle} / ${STATE.totalPuzzles}`;
  const sc = el('hudScore'); if(sc) sc.textContent=STATE.score;
  const hn = el('hudHints'); if(hn) hn.textContent=STATE.hintsRemaining;
  updateTimerDisplay(); updateSanityBar();
}

function buildProgressDots() {
  const c=document.getElementById('progressStages'); c.innerHTML='';
  for(let i=1;i<=STATE.totalPuzzles;i++){
    const d=document.createElement('div'); d.className='progress-dot'; d.id=`progressDot${i}`;
    if(i===1) d.classList.add('active'); c.appendChild(d);
  }
  updateProgressBar();
}
function updateProgressBar() {
  document.getElementById('progressBar').style.width=`${(STATE.puzzlesSolved/STATE.totalPuzzles)*100}%`;
  for(let i=1;i<=STATE.totalPuzzles;i++){
    const d=document.getElementById(`progressDot${i}`); if(!d) continue;
    d.classList.remove('completed','active');
    if(STATE.solvedPuzzles.has(i)) d.classList.add('completed');
    else if(i===STATE.currentPuzzle) d.classList.add('active');
  }
}

// ═══════════════════════════════════════════════════════
// 3D ROOM / PARALLAX
// ═══════════════════════════════════════════════════════

function update3DRoom(num) {
  const p=PUZZLES[num]; if(!p) return;
  const wb=document.getElementById('wallBack'), ls=document.getElementById('roomLight');

  // Grid line color based on theme
  const gridColor = STATE.activeThemeKey==='asylum' ? 'rgba(0,200,80,0.03)'
    : STATE.activeThemeKey==='catacombs' ? 'rgba(180,140,60,0.03)'
    : 'rgba(139,0,0,0.03)';

  if(wb && p.roomTheme){
    wb.style.background=`
      radial-gradient(ellipse at center,${p.roomTheme.wallColor},rgba(10,5,5,0.98)),
      repeating-linear-gradient(0deg,transparent,transparent 60px,${gridColor} 60px,${gridColor} 61px),
      repeating-linear-gradient(90deg,transparent,transparent 60px,${gridColor} 60px,${gridColor} 61px)`;
  }
  if(ls && p.roomTheme) ls.style.background=`radial-gradient(circle,${p.roomTheme.lightColor} 0%,transparent 70%)`;
}

function init3DParallax() {
  const scene=document.getElementById('room3DScene'); if(!scene) return;
  document.addEventListener('mousemove',e=>{
    if(!STATE.gameActive) return;
    const r=scene.getBoundingClientRect();
    const dx=(e.clientX-(r.left+r.width/2))/r.width;
    const dy=(e.clientY-(r.top+r.height/2))/r.height;
    scene.style.transform=`rotateY(${dx*3}deg) rotateX(${-dy*2}deg)`;
  });
}

function createDustParticles() {
  const c=document.getElementById('roomDust'); if(!c) return; c.innerHTML='';
  for(let i=0;i<20;i++){
    const d=document.createElement('div'); d.className='dust-particle';
    d.style.left=`${Math.random()*100}%`; d.style.top=`${Math.random()*100}%`;
    d.style.animationDelay=`${Math.random()*8}s`; d.style.animationDuration=`${6+Math.random()*6}s`;
    c.appendChild(d);
  }
}

// ═══════════════════════════════════════════════════════
// PUZZLE DISPLAY & NAVIGATION
// ═══════════════════════════════════════════════════════

function showPuzzle(num) {
  document.querySelectorAll('.puzzle-room').forEach(r=>r.classList.remove('active'));
  const p=document.getElementById(`puzzle${num}`); if(p) p.classList.add('active');
  STATE.currentPuzzle=num; updateHUD(); updateProgressBar(); update3DRoom(num); updateNavButtons();
  if(typeof GameFX!=='undefined') GameFX.setRoomTitleGlitch(num);
}

function updateNavButtons() {
  const nl=document.getElementById('navLeft'), nr=document.getElementById('navRight');
  if(STATE.currentPuzzle>1 && STATE.solvedPuzzles.has(STATE.currentPuzzle-1)) nl.classList.remove('hidden'); else nl.classList.add('hidden');
  if(STATE.currentPuzzle<STATE.totalPuzzles && STATE.solvedPuzzles.has(STATE.currentPuzzle)) nr.classList.remove('hidden'); else nr.classList.add('hidden');
}

function navigateRoom(dir) {
  const nr=STATE.currentPuzzle+dir;
  if(nr<1||nr>STATE.totalPuzzles) return;
  AudioEngine.doorCreak();
  GameFX.flash('room');
  GameFX.portalEffect();
  const ov=document.getElementById('roomContentOverlay');
  ov.style.opacity='0'; ov.style.transform=dir>0?'translateX(-30px)':'translateX(30px)';
  setTimeout(()=>{
    showPuzzle(nr);
    ov.style.transform=dir>0?'translateX(30px)':'translateX(-30px)';
    requestAnimationFrame(()=>{
      ov.style.transition='all 0.4s ease'; ov.style.opacity='1'; ov.style.transform='translateX(0)';
      setTimeout(()=>{ov.style.transition='';},400);
    });
  },200);
}

// ═══════════════════════════════════════════════════════
// CLUE INTERACTION
// ═══════════════════════════════════════════════════════

function showClue(puzzleNum, object) {
  const puzzle=PUZZLES[puzzleNum]; if(!puzzle||!puzzle.clues[object]) return;
  AudioEngine.clueReveal();
  const ck=`${puzzleNum}-${object}`; STATE.discoveredClues[ck]=true;

  const ct=document.getElementById(`clueText${puzzleNum}`);
  ct.className='clue-text revealed';
  GameFX.typewriterClue(ct, puzzle.clues[object].text, 25);

  document.querySelectorAll(`#puzzle${puzzleNum} .room-object`).forEach(o=>{
    if(o.dataset.clue===object) o.classList.add('discovered');
  });

  // Check all clues in this room
  const allKeys=Object.keys(puzzle.clues).map(k=>`${puzzleNum}-${k}`);
  if(allKeys.every(k=>STATE.discoveredClues[k])) awardBadge('explorer');

  // Check ALL rooms
  let total=0,found=0;
  for(let pn=1;pn<=STATE.totalPuzzles;pn++){
    const pp=PUZZLES[pn]; if(!pp) continue;
    for(const ck2 of Object.keys(pp.clues)){ total++; if(STATE.discoveredClues[`${pn}-${ck2}`]) found++; }
  }
  if(found===total) awardBadge('collector');

  restoreSanity(3);
  const panel=document.getElementById(`cluePanel${puzzleNum}`);
  panel.style.animation='none'; panel.offsetHeight; panel.style.animation='clueReveal 0.5s ease';
}

// ═══════════════════════════════════════════════════════
// ANSWER SUBMISSION
// ═══════════════════════════════════════════════════════

function submitAnswer(puzzleNum) {
  if(!STATE.gameActive) return;
  AudioEngine.click();
  const inp=document.getElementById(`answer${puzzleNum}`);
  const fb=document.getElementById(`feedback${puzzleNum}`);
  const puzzle=PUZZLES[puzzleNum];
  const ans=inp.value.trim().toLowerCase();

  if(!ans){ fb.textContent='⚠️ Enter an answer!'; fb.className='answer-feedback wrong'; return; }

  if(ans===puzzle.answer.toLowerCase()){
    AudioEngine.correct();
    inp.className='answer-input horror-input correct';
    fb.textContent='✅ Correct! The way forward opens...';
    fb.className='answer-feedback correct';

    if(firstAttemptPuzzles.has(puzzleNum)) awardBadge('untouchable');
    const bonus=Math.floor(STATE.timeRemaining/6);
    const totalPoints = puzzle.scoreValue+bonus;
    STATE.score+=totalPoints;
    STATE.puzzlesSolved++; STATE.solvedPuzzles.add(puzzleNum);
    if(puzzle.inventoryReward) addToInventory(puzzle.inventoryReward);
    restoreSanity(15); updateHUD(); updateProgressBar(); updateNavButtons();

    // Advanced FX — correct answer
    GameFX.flash('correct');
    GameFX.scoreBump();
    GameFX.registerCombo();
    const inputRect = inp.getBoundingClientRect();
    GameFX.spawnBurst(inputRect.left + inputRect.width/2, inputRect.top, ['#4caf50','#69f0ae','#a5d6a7','#fff'], 30);
    GameFX.scorePopup(inputRect.left + inputRect.width/2, inputRect.top - 20, totalPoints);

    // Room-specific mechanic callbacks on correct answer
    if(STATE.activeThemeKey==='underwater' && STATE._restoreOxygen) STATE._restoreOxygen(25);
    if(STATE.activeThemeKey==='spacestation' && STATE._coolReactor) STATE._coolReactor(20);
    if(STATE.activeThemeKey==='hackervault' && STATE._addHackProgress) STATE._addHackProgress(25);

    const ov=document.getElementById('roomContentOverlay');
    ov.style.boxShadow='inset 0 0 60px rgba(46,125,50,0.3)';
    setTimeout(()=>{ov.style.boxShadow='';},800);

    setTimeout(()=>{
      if(puzzleNum<STATE.totalPuzzles){
        const next=puzzleNum+1;
        AudioEngine.doorCreak();
        CameraShake.shake('light');
        showStory(`room${next}`,()=>showPuzzle(next));
      } else { endGame(true); }
    },1500);
  } else {
    AudioEngine.wrong();
    inp.className='answer-input horror-input wrong';
    fb.textContent='❌ Wrong answer...';
    fb.className='answer-feedback wrong';
    firstAttemptPuzzles.delete(puzzleNum);
    wrongAnswerCount++; if(wrongAnswerCount>=10) awardBadge('clueless');
    STATE.score=Math.max(0,STATE.score-50); reduceSanity(8); updateHUD();
    CameraShake.shake('heavy');
    // Mini jumpscare on every 3rd wrong answer
    if (wrongAnswerCount % 3 === 0) {
      JumpscareEngine.miniScare(STATE.activeThemeKey);
    }
    // Advanced FX — wrong answer
    GameFX.flash('wrong');
    GameFX._comboCount = 0;
    const wrongRect = inp.getBoundingClientRect();
    GameFX.spawnBurst(wrongRect.left + wrongRect.width/2, wrongRect.top, ['#c62828','#ef5350','#ff8a80'], 15);
    setTimeout(()=>{inp.className='answer-input horror-input';},600);
  }
}

// ═══════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════

function addToInventory(item) { STATE.inventory.push(item); updateInventoryUI(); GameFX.inventoryCollectFX(STATE.inventory.length - 1); }
function updateInventoryUI() {
  for(let i=0;i<6;i++){
    const s=document.getElementById(`invSlot${i}`);
    if(s){ if(STATE.inventory[i]){s.textContent=STATE.inventory[i];s.classList.remove('empty');s.classList.add('filled');} else {s.textContent='';s.classList.add('empty');s.classList.remove('filled');} }
  }
}
function resetInventoryUI() {
  for(let i=0;i<6;i++){const s=document.getElementById(`invSlot${i}`);if(s){s.textContent='';s.classList.add('empty');s.classList.remove('filled');}}
}

// ═══════════════════════════════════════════════════════
// HINTS
// ═══════════════════════════════════════════════════════

function useHint(puzzleNum) {
  if(STATE.hintsRemaining<=0) return;
  AudioEngine.whisper();
  const puzzle=PUZZLES[puzzleNum];
  const fb=document.getElementById(`feedback${puzzleNum}`);
  STATE.hintsRemaining--; STATE.hintsUsed++;
  fb.textContent=`💡 Hint: ${puzzle.hint}`; fb.className='answer-feedback'; fb.style.color='#ff9800';
  STATE.score=Math.max(0,STATE.score-150); reduceSanity(10); updateHUD();
}

// ═══════════════════════════════════════════════════════
// NOTES (Music Puzzles — dynamic)
// ═══════════════════════════════════════════════════════

function addNote(puzzleNum, note) {
  const inp=document.getElementById(`answer${puzzleNum}`);
  const maxLen=parseInt(inp.getAttribute('maxlength'))||10;
  if(inp.value.length<maxLen){ inp.value+=note; AudioEngine.notePlay(note); }
}
function clearNotes(puzzleNum) {
  document.getElementById(`answer${puzzleNum}`).value=''; AudioEngine.click();
}

// ═══════════════════════════════════════════════════════
// GAME END
// ═══════════════════════════════════════════════════════

function endGame(escaped) {
  stopTimer(); AudioEngine.stopAmbient(); STATE.gameActive=false;
  JumpscareEngine.stopRandomScares();
  if (typeof ROOM_MECHANICS !== 'undefined') ROOM_MECHANICS.cleanupRoom();
  document.body.classList.remove('flicker-effect','high-dread','time-glitch');
  const ri=document.getElementById('resultIcon');
  const rt=document.getElementById('resultTitle');
  const rm=document.getElementById('resultMessage');

  if(escaped){
    AudioEngine.achievement();
    GameFX.victoryEffect();
    ri.textContent='🎉'; rt.textContent='You Escaped!';
    rm.textContent=ACTIVE_THEME.victoryMsg(STATE.playerName);

    awardBadge('first_escape');
    if(STATE.hintsUsed===0) awardBadge('no_hints');
    if(STATE.timeElapsed<180) awardBadge('speed_demon');
    if(STATE.timeElapsed<300) awardBadge('quick_escape');
    if(STATE.puzzlesSolved===STATE.totalPuzzles) awardBadge('perfect_clear');
    if(STATE.score>=4500) awardBadge('high_scorer');
    if(STATE.timeRemaining<60) awardBadge('survivor');
    if(STATE.sanity<30) awardBadge('sanity_check');

    // Theme-specific badges
    const themeBadgeMap = {
      asylum:'asylum_escape', catacombs:'catacomb_escape',
      quantum:'quantum_escape', cyberpunk:'cyberpunk_escape',
      underwater:'underwater_escape', victorian:'victorian_escape',
      spacestation:'station_escape', temple:'temple_escape',
      hackervault:'hacker_escape'
    };
    if(themeBadgeMap[STATE.activeThemeKey]) awardBadge(themeBadgeMap[STATE.activeThemeKey]);

    // Check all-themes badges
    const earned=getEarnedBadges();
    if(earned.includes('first_escape') && earned.includes('asylum_escape') && earned.includes('catacomb_escape'))
      awardBadge('all_themes');
    const allTenBadges = ['first_escape','asylum_escape','catacomb_escape','quantum_escape','cyberpunk_escape','underwater_escape','victorian_escape','station_escape','temple_escape','hacker_escape'];
    if(allTenBadges.every(b=>earned.includes(b))) awardBadge('all_ten_themes');

    const _ecKey = 'escaperoom_escapecount_' + (getCurrentUser()||'guest').toLowerCase();
    let ec=parseInt(localStorage.getItem(_ecKey)||'0'); ec++;
    localStorage.setItem(_ecKey,ec.toString());
    if(ec>=5) awardBadge('five_timer');
  } else {
    AudioEngine.horror();
    GameFX.gameOverEffect();
    // Full dramatic jumpscare on game over
    JumpscareEngine.trigger(STATE.activeThemeKey, { shake: 'violent', duration: 2500 });
    ri.textContent='💀'; rt.textContent="Time's Up...";
    rm.textContent=ACTIVE_THEME.defeatMsg(STATE.playerName);
    if(STATE.sanity<30) awardBadge('sanity_check');
  }

  document.getElementById('resultTime').textContent=formatTime(STATE.timeElapsed);
  document.getElementById('resultScore').textContent=STATE.score;
  document.getElementById('resultPuzzles').textContent=`${STATE.puzzlesSolved}/${STATE.totalPuzzles}`;
  document.getElementById('resultHints').textContent=STATE.hintsUsed;

  const allEarned=getEarnedBadges();
  const earned2=ALL_BADGES.filter(b=>allEarned.includes(b.id));
  document.getElementById('resultBadges').innerHTML=earned2.slice(0,6).map((b,i)=>
    `<div class="result-badge" style="animation-delay:${i*0.1}s">${b.icon} ${b.name}</div>`).join('');

  saveScore(escaped);
  saveGameEndToProfile(escaped);

  document.getElementById('inventoryBar').classList.add('hidden');
  showStory(escaped?'victory':'defeat',()=>{
    document.getElementById('gameArea').classList.add('hidden');
    document.getElementById('gameResult').classList.remove('hidden');
  });
}

// ═══════════════════════════════════════════════════════
// BADGE SYSTEM
// ═══════════════════════════════════════════════════════

function _badgeKey() { const u = getCurrentUser(); return u ? `escaperoom_badges_${u.toLowerCase()}` : 'escaperoom_badges_guest'; }
function getEarnedBadges() { try{return JSON.parse(localStorage.getItem(_badgeKey()))||[];}catch{return[];} }
function saveEarnedBadges(b) { localStorage.setItem(_badgeKey(),JSON.stringify(b)); }

function awardBadge(id) {
  const earned=getEarnedBadges();
  if(!earned.includes(id)){
    earned.push(id); saveEarnedBadges(earned);
    const badge=ALL_BADGES.find(b=>b.id===id);
    if(badge){showBadgeNotification(badge); AudioEngine.achievement();}
  }
}

function showToast(message, type = 'info') {
  const t = document.createElement('div');
  const colors = { success: '#2e7d32', error: '#c62828', info: '#1565c0', warning: '#e65100' };
  const bg = colors[type] || colors.info;
  t.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,${bg},${bg}cc);color:#fff;padding:0.8rem 1.5rem;border-radius:12px;z-index:100000;font-family:'Inter',sans-serif;font-size:0.95rem;font-weight:500;box-shadow:0 4px 20px ${bg}66;animation:toastIn 0.4s ease,toastOut 0.4s ease 3s forwards;white-space:nowrap;max-width:90vw;overflow:hidden;text-overflow:ellipsis;`;
  t.textContent = message;
  if (!document.getElementById('toast-styles')) {
    const s = document.createElement('style'); s.id = 'toast-styles';
    s.textContent = `@keyframes toastIn{from{transform:translateX(-50%) translateY(-40px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}@keyframes toastOut{from{opacity:1}to{opacity:0;transform:translateX(-50%) translateY(-20px)}}`;
    document.head.appendChild(s);
  }
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3800);
}

function showBadgeNotification(badge) {
  const n=document.createElement('div');
  // Determine theme accent color
  const accentColor = STATE.activeThemeKey==='asylum'?'#00c853': STATE.activeThemeKey==='catacombs'?'#ff8f00':'#c62828';
  n.style.cssText=`position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#0f0a0a,#1a1010);border:1px solid ${accentColor};border-radius:12px;padding:1rem 1.5rem;display:flex;align-items:center;gap:0.8rem;z-index:10001;animation:slideInRight 0.5s ease,fadeOut 0.5s ease 3s forwards;box-shadow:0 0 20px ${accentColor}44;font-family:'Inter',sans-serif;color:#d4c5c5;`;
  n.innerHTML=`<span style="font-size:2rem">${badge.icon}</span><div><div style="font-family:'Creepster',cursive;color:${accentColor};font-size:0.8rem">BADGE UNLOCKED</div><div style="font-weight:600;font-size:0.95rem">${badge.name}</div></div>`;
  if(!document.getElementById('badge-notif-styles')){
    const s=document.createElement('style'); s.id='badge-notif-styles';
    s.textContent=`@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes fadeOut{from{opacity:1}to{opacity:0;transform:translateX(50px)}}`;
    document.head.appendChild(s);
  }
  document.body.appendChild(n); setTimeout(()=>n.remove(),4000);
}

function renderBadgePage() {
  const earned=getEarnedBadges();
  const grid=document.getElementById('badgeGrid');
  document.getElementById('badgesEarned').textContent=earned.length;
  document.getElementById('badgesTotal').textContent=ALL_BADGES.length;
  document.getElementById('badgesPercent').textContent=Math.round((earned.length/ALL_BADGES.length)*100)+'%';
  grid.innerHTML=ALL_BADGES.map(b=>{
    const is=earned.includes(b.id);
    return `<div class="badge-card ${is?'earned':'locked'}">${!is?'<div class="badge-card-lock">🔒</div>':''}<div class="badge-card-icon">${b.icon}</div><div class="badge-card-name">${b.name}</div><div class="badge-card-desc">${is?b.desc:'???'}</div></div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════
// LIGHTNING
// ═══════════════════════════════════════════════════════

function triggerLightning() {
  AudioEngine.thunder();
  const o=document.getElementById('lightningOverlay');
  o.classList.add('flash'); setTimeout(()=>o.classList.remove('flash'),100);
  setTimeout(()=>{o.classList.add('flash'); setTimeout(()=>o.classList.remove('flash'),50);},200);
}

// ═══════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════

function saveScore(escaped) {
  const scores=getScores();
  scores.push({
    name:STATE.playerName, score:STATE.score, time:STATE.timeElapsed,
    timeFormatted:formatTime(STATE.timeElapsed),
    puzzles:`${STATE.puzzlesSolved}/${STATE.totalPuzzles}`,
    theme: ACTIVE_THEME ? ACTIVE_THEME.name : 'Unknown',
    escaped, date:new Date().toISOString(),
    dateFormatted:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
  });
  scores.sort((a,b)=>b.score-a.score||a.time-b.time);
  localStorage.setItem('escaperoom_scores',JSON.stringify(scores.slice(0,50)));
}
function getScores() { try{return JSON.parse(localStorage.getItem('escaperoom_scores'))||[];}catch{return[];} }

function renderLeaderboard(filter='all') {
  const scores=getScores(); const tbody=document.getElementById('leaderboardBody');
  let filtered=scores; const now=new Date();
  if(filter==='today'){ const td=now.toDateString(); filtered=scores.filter(s=>new Date(s.date).toDateString()===td); }
  else if(filter==='week'){ const wa=new Date(now-7*864e5); filtered=scores.filter(s=>new Date(s.date)>=wa); }

  if(!filtered.length){ tbody.innerHTML='<tr class="empty-row"><td colspan="7">No survivors yet. Will you be the first?</td></tr>'; return; }

  tbody.innerHTML=filtered.map((s,i)=>{
    const rank=i+1; let rd=rank,rc='';
    if(rank===1){rd='🥇';rc='rank-1';}else if(rank===2){rd='🥈';rc='rank-2';}else if(rank===3){rd='🥉';rc='rank-3';}
    return `<tr class="${rc}"><td><span class="rank-medal">${rd}</span></td><td>${escapeHTML(s.name)} ${s.escaped?'✅':'💀'}</td><td style="font-family:var(--font-display);font-weight:700;color:var(--accent)">${s.score}</td><td>${s.timeFormatted}</td><td>${s.puzzles}</td><td>${s.theme||'Mansion'}</td><td>${s.dateFormatted}</td></tr>`;
  }).join('');
}

function filterLeaderboard(filter) {
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active'); renderLeaderboard(filter);
}
function clearLeaderboard() { if(confirm('Erase all records?')){ localStorage.removeItem('escaperoom_scores'); renderLeaderboard(); } }

// ═══════════════════════════════════════════════════════
// FORUM
// ═══════════════════════════════════════════════════════

function getForumPosts() { try{return JSON.parse(localStorage.getItem('escaperoom_forum'))||[];}catch{return[];} }
function saveForumPosts(p) { localStorage.setItem('escaperoom_forum',JSON.stringify(p)); }

function postForumMessage() {
  AudioEngine.click();
  const author=document.getElementById('forumAuthor').value.trim()||'Anonymous';
  const msg=document.getElementById('forumMessage').value.trim();
  const cat=document.getElementById('forumCategory').value;
  if(!msg){alert('Write something first.');return;}
  const posts=getForumPosts();
  posts.unshift({id:Date.now(),author,message:msg,category:cat,date:new Date().toISOString(),
    dateFormatted:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}),likes:0,likedByUser:false});
  saveForumPosts(posts);
  document.getElementById('forumMessage').value='';
  document.getElementById('forumCharCount').textContent='0 / 500';
  renderForumPosts();
}

function renderForumPosts() {
  const posts=getForumPosts(); const c=document.getElementById('forumPosts');
  if(!posts.length){c.innerHTML='<div class="forum-empty">The wall is blank. Be the first to write upon it...</div>';return;}
  const cl={general:'💬 General',tips:'💡 Tips',spoilers:'⚠️ Spoilers',bugs:'🐛 Bug'};
  c.innerHTML=posts.map(p=>`<div class="forum-post" data-id="${p.id}"><div class="forum-post-header"><span class="forum-author">${escapeHTML(p.author)}</span><span class="forum-category ${p.category}">${cl[p.category]||p.category}</span></div><div class="forum-post-body">${escapeHTML(p.message)}</div><div class="forum-post-meta"><span>${p.dateFormatted}</span><div class="forum-post-actions"><button class="forum-action-btn ${p.likedByUser?'liked':''}" onclick="likePost(${p.id})">${p.likedByUser?'❤️':'🤍'} ${p.likes}</button><button class="forum-delete-btn" onclick="deletePost(${p.id})">🗑️</button></div></div></div>`).join('');
}

function likePost(id) {
  const posts=getForumPosts(); const p=posts.find(x=>x.id===id);
  if(p){if(p.likedByUser){p.likes=Math.max(0,p.likes-1);p.likedByUser=false;}else{p.likes++;p.likedByUser=true;} saveForumPosts(posts); renderForumPosts();}
}
function deletePost(id) { if(confirm('Erase this message?')){saveForumPosts(getForumPosts().filter(x=>x.id!==id)); renderForumPosts();} }

// ═══════════════════════════════════════════════════════
// DRAG & DROP
// ═══════════════════════════════════════════════════════

let dragState={active:false,el:null,startX:0,startY:0};
function initDragSystem(){document.addEventListener('mousedown',hdStart);document.addEventListener('touchstart',htStart,{passive:false});}

function hdStart(e){
  const o=e.target.closest('.horror-object'); if(!o) return;
  AudioEngine.click(); dragState={active:true,el:o,startX:e.clientX,startY:e.clientY};
  o.classList.add('dragging'); o.style.zIndex='100';
  document.addEventListener('mousemove',hdMove); document.addEventListener('mouseup',hdEnd);
}
function hdMove(e){
  if(!dragState.active||!dragState.el) return;
  const dx=e.clientX-dragState.startX,dy=e.clientY-dragState.startY;
  dragState.el.style.transform=`translate(${dx}px,${dy}px) scale(1.1) rotate(${dx*0.05}deg)`;
}
function hdEnd(e){
  if(!dragState.active||!dragState.el) return;
  const o=dragState.el; o.classList.remove('dragging'); o.style.transform=''; o.style.zIndex='';
  o.style.transition='transform 0.3s ease'; setTimeout(()=>{o.style.transition='';},300);
  const cp=o.closest('.room-scene')?.querySelector('.horror-clue-panel');
  if(cp){ const r=cp.getBoundingClientRect();
    if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
      const pn=parseInt(o.dataset.puzzle),ck=o.dataset.clue;
      if(pn&&ck) showClue(pn,ck);
    }
  }
  dragState.active=false; dragState.el=null;
  document.removeEventListener('mousemove',hdMove); document.removeEventListener('mouseup',hdEnd);
}

function htStart(e){
  const o=e.target.closest('.horror-object'); if(!o) return;
  const t=e.touches[0]; AudioEngine.click();
  dragState={active:true,el:o,startX:t.clientX,startY:t.clientY}; o.classList.add('dragging');
  document.addEventListener('touchmove',htMove,{passive:false}); document.addEventListener('touchend',htEnd);
}
function htMove(e){ if(!dragState.active||!dragState.el) return; e.preventDefault();
  const t=e.touches[0],dx=t.clientX-dragState.startX,dy=t.clientY-dragState.startY;
  dragState.el.style.transform=`translate(${dx}px,${dy}px) scale(1.1)`;
}
function htEnd(){
  if(!dragState.active||!dragState.el) return;
  dragState.el.classList.remove('dragging'); dragState.el.style.transform='';
  dragState.el.style.transition='transform 0.3s ease'; setTimeout(()=>{if(dragState.el) dragState.el.style.transition='';},300);
  dragState.active=false; dragState.el=null;
  document.removeEventListener('touchmove',htMove); document.removeEventListener('touchend',htEnd);
}

// ═══════════════════════════════════════════════════════
// ROOM MECHANICS — Unique overlays per theme
// ═══════════════════════════════════════════════════════

const ROOM_MECHANICS = {
  _activeIntervals: [],
  _activeElements: [],

  initRoomLogic(themeKey) {
    this.cleanupRoom();
    const initFn = this['init_' + themeKey];
    if (initFn) initFn.call(this);
  },

  cleanupRoom() {
    this._activeIntervals.forEach(id => clearInterval(id));
    this._activeIntervals = [];
    this._activeElements.forEach(el => { try { el.remove(); } catch(e){} });
    this._activeElements = [];
    const mhud = document.getElementById('mechanicHUD');
    if (mhud) mhud.innerHTML = '';
    // Clean up state refs
    delete STATE._roomOxygen; delete STATE._restoreOxygen;
    delete STATE._coolReactor; delete STATE._hackProgress; delete STATE._addHackProgress;
  },

  _addInterval(fn, ms) {
    const id = setInterval(fn, ms);
    this._activeIntervals.push(id);
    return id;
  },

  _addElement(el) {
    this._activeElements.push(el);
    return el;
  },

  // ─── UNDERWATER ───
  init_underwater() {
    const mhud = document.getElementById('mechanicHUD');
    if (!mhud) return;
    mhud.innerHTML = `
      <div class="mechanic-bar oxygen-bar">
        <span class="mech-label">\ud83e\udee7 OXYGEN</span>
        <div class="mech-bar-track"><div class="mech-bar-fill oxygen-fill" id="oxygenFill" style="width:100%"></div></div>
        <span class="mech-value" id="oxygenValue">100%</span>
      </div>`;
    let oxygen = 100;
    this._addInterval(() => {
      if (!STATE.gameActive) return;
      oxygen = Math.max(0, oxygen - 0.5);
      const fill = document.getElementById('oxygenFill');
      const val = document.getElementById('oxygenValue');
      if (fill) fill.style.width = oxygen + '%';
      if (val) val.textContent = Math.round(oxygen) + '%';
      if (oxygen <= 30) {
        AudioEngine.playTone(800, 0.1, 'square', 0.08);
        if (fill) fill.style.background = 'linear-gradient(90deg, #c62828, #e53935)';
      }
      if (oxygen <= 0) endGame(false);
    }, 1000);
    // Bubbles
    this._addInterval(() => {
      if (!STATE.gameActive) return;
      const wrapper = document.getElementById('room3DWrapper');
      if (!wrapper) return;
      const bubble = document.createElement('div');
      bubble.className = 'underwater-bubble';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.animationDuration = (2 + Math.random() * 3) + 's';
      wrapper.appendChild(bubble);
      this._addElement(bubble);
      setTimeout(() => bubble.remove(), 5000);
    }, 600);
    STATE._restoreOxygen = (amt) => { oxygen = Math.min(100, oxygen + amt); };
  },

  // ─── VICTORIAN ───
  init_victorian() {
    const mhud = document.getElementById('mechanicHUD');
    if (!mhud) return;
    mhud.innerHTML = `
      <div class="mechanic-bar dread-bar">
        <span class="mech-label">\ud83e\udde0 DREAD</span>
        <div class="mech-bar-track"><div class="mech-bar-fill dread-fill" id="dreadFill" style="width:0%"></div></div>
        <span class="mech-value" id="dreadValue">0%</span>
      </div>`;
    let dread = 0;
    this._addInterval(() => {
      if (!STATE.gameActive) return;
      dread = Math.min(100, dread + 0.3);
      const fill = document.getElementById('dreadFill');
      const val = document.getElementById('dreadValue');
      if (fill) fill.style.width = dread + '%';
      if (val) val.textContent = Math.round(dread) + '%';
      if (dread > 70) document.body.classList.add('high-dread');
      if (Math.random() < 0.15) {
        document.body.classList.add('flicker-effect');
        setTimeout(() => document.body.classList.remove('flicker-effect'), 150);
        if (Math.random() < 0.3) AudioEngine.whisper();
      }
    }, 2000);
    // Ghost shadows
    this._addInterval(() => {
      if (!STATE.gameActive || Math.random() > 0.25) return;
      const wrapper = document.getElementById('room3DWrapper');
      if (!wrapper) return;
      const ghost = document.createElement('div');
      ghost.className = 'ghost-shadow';
      ghost.style.left = (Math.random() * 80 + 10) + '%';
      ghost.style.top = (Math.random() * 60 + 20) + '%';
      wrapper.appendChild(ghost);
      this._addElement(ghost);
      setTimeout(() => ghost.remove(), 3000);
    }, 4000);
  },

  // ─── SPACE STATION ───
  init_spacestation() {
    const mhud = document.getElementById('mechanicHUD');
    if (!mhud) return;
    mhud.innerHTML = `
      <div class="mechanic-bar temp-bar">
        <span class="mech-label">\ud83c\udf21\ufe0f REACTOR TEMP</span>
        <div class="mech-bar-track"><div class="mech-bar-fill temp-fill" id="tempFill" style="width:30%"></div></div>
        <span class="mech-value" id="tempValue">30\u00b0C</span>
      </div>`;
    let temp = 30;
    this._addInterval(() => {
      if (!STATE.gameActive) return;
      temp = Math.min(100, temp + 0.4);
      const fill = document.getElementById('tempFill');
      const val = document.getElementById('tempValue');
      if (fill) fill.style.width = temp + '%';
      if (val) val.textContent = Math.round(temp) + '\u00b0C';
      if (temp >= 80) {
        if (fill) fill.style.background = 'linear-gradient(90deg, #e65100, #c62828)';
        if (Math.random() < 0.3) AudioEngine.playTone(400, 0.2, 'square', 0.08);
      }
      if (temp >= 100) endGame(false);
    }, 1000);
    STATE._coolReactor = (amt) => { temp = Math.max(20, temp - amt); };
  },

  // ─── TEMPLE ───
  init_temple() {
    const mhud = document.getElementById('mechanicHUD');
    if (!mhud) return;
    mhud.innerHTML = `
      <div class="mechanic-bar align-bar">
        <span class="mech-label">\u2728 ALIGNMENT</span>
        <div class="mech-bar-track"><div class="mech-bar-fill align-fill" id="alignFill" style="width:0%"></div></div>
        <span class="mech-value" id="alignValue">0%</span>
      </div>`;
    // Golden particles
    this._addInterval(() => {
      if (!STATE.gameActive || Math.random() > 0.3) return;
      const wrapper = document.getElementById('room3DWrapper');
      if (!wrapper) return;
      const spark = document.createElement('div');
      spark.className = 'temple-spark';
      spark.style.left = Math.random() * 100 + '%';
      spark.style.top = Math.random() * 100 + '%';
      wrapper.appendChild(spark);
      this._addElement(spark);
      setTimeout(() => spark.remove(), 2000);
    }, 800);
  },

  // ─── QUANTUM ───
  init_quantum() {
    const mhud = document.getElementById('mechanicHUD');
    if (!mhud) return;
    mhud.innerHTML = `
      <div class="mechanic-bar loop-bar">
        <span class="mech-label">\u23f3 TIME STABILITY</span>
        <div class="mech-bar-track"><div class="mech-bar-fill loop-fill" id="loopFill" style="width:100%"></div></div>
        <span class="mech-value" id="loopValue">STABLE</span>
      </div>`;
    let stability = 100;
    this._addInterval(() => {
      if (!STATE.gameActive) return;
      stability = Math.max(0, stability - 0.2);
      const fill = document.getElementById('loopFill');
      const val = document.getElementById('loopValue');
      if (fill) fill.style.width = stability + '%';
      if (stability < 50) {
        if (val) val.textContent = 'UNSTABLE';
        if (fill) fill.style.background = 'linear-gradient(90deg, #7b1fa2, #e040fb)';
      }
      if (stability < 30) {
        if (val) val.textContent = 'CRITICAL';
        if (Math.random() < 0.2) {
          document.body.classList.add('time-glitch');
          setTimeout(() => document.body.classList.remove('time-glitch'), 200);
        }
      }
    }, 1500);
  },

  // ─── CYBERPUNK ───
  init_cyberpunk() {
    // Digital rain effect
    this._addInterval(() => {
      if (!STATE.gameActive || Math.random() > 0.4) return;
      const wrapper = document.getElementById('room3DWrapper');
      if (!wrapper) return;
      const rain = document.createElement('div');
      rain.className = 'digital-rain';
      rain.textContent = String.fromCharCode(0x30A0 + Math.random() * 96);
      rain.style.left = Math.random() * 100 + '%';
      rain.style.animationDuration = (1 + Math.random() * 2) + 's';
      wrapper.appendChild(rain);
      this._addElement(rain);
      setTimeout(() => rain.remove(), 3000);
    }, 250);
  },

  // ─── HACKER VAULT ───
  init_hackervault() {
    const mhud = document.getElementById('mechanicHUD');
    if (!mhud) return;
    mhud.innerHTML = `
      <div class="mechanic-bar hack-bar">
        <span class="mech-label">\ud83d\udcbb HACK PROGRESS</span>
        <div class="mech-bar-track"><div class="mech-bar-fill hack-fill" id="hackFill" style="width:0%"></div></div>
        <span class="mech-value" id="hackValue">0%</span>
      </div>
      <div class="hacker-terminal" id="hackerTerminal">
        <div class="term-output" id="termOutput">root@vault:~$ Initializing breach sequence...\nroot@vault:~$ Firewall detected. Solve puzzles to bypass.</div>
      </div>`;
    let hackProgress = 0;
    this._addInterval(() => {
      if (!STATE.gameActive) return;
      const output = document.getElementById('termOutput');
      if (!output) return;
      const msgs = [
        'Scanning port 443...',
        'Decrypting layer ' + Math.floor(Math.random()*8+1) + '...',
        'Probing firewall node...',
        'Analyzing packet structure...',
        'Brute-force attempt ' + Math.floor(Math.random()*999) + '...',
        'Memory dump: 0x' + Math.random().toString(16).slice(2,10),
      ];
      output.textContent += '\nroot@vault:~$ ' + msgs[Math.floor(Math.random()*msgs.length)];
      output.scrollTop = output.scrollHeight;
    }, 3000);
    STATE._hackProgress = () => hackProgress;
    STATE._addHackProgress = (amt) => {
      hackProgress = Math.min(100, hackProgress + amt);
      const fill = document.getElementById('hackFill');
      const val = document.getElementById('hackValue');
      if (fill) fill.style.width = hackProgress + '%';
      if (val) val.textContent = hackProgress + '%';
    };
  }
};

// ═══════════════════════════════════════════════════════
// HERO PARTICLES
// ═══════════════════════════════════════════════════════

function createHeroParticles(){
  const c=document.getElementById('heroParticles'); if(!c) return;
  for(let i=0;i<30;i++){
    const p=document.createElement('div'); p.className='particle';
    p.style.left=`${Math.random()*100}%`; p.style.top=`${60+Math.random()*40}%`;
    p.style.animationDelay=`${Math.random()*6}s`; p.style.animationDuration=`${4+Math.random()*4}s`;
    p.style.background=['#c62828','#7b1fa2','#2e7d32','#e65100','#8b0000'][Math.floor(Math.random()*5)];
    c.appendChild(p);
  }
}

// ═══════════════════════════════════════════════════════
// HORROR CANVAS
// ═══════════════════════════════════════════════════════

function initHorrorCanvas(){
  const cv=document.getElementById('horrorCanvas'); if(!cv) return;
  const ctx=cv.getContext('2d'); cv.width=cv.offsetWidth; cv.height=600;
  const pts=Array.from({length:50},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,sz:Math.random()*3+1,sx:(Math.random()-0.5)*0.5,sy:(Math.random()-0.5)*0.3,op:Math.random()*0.5}));
  (function anim(){
    ctx.clearRect(0,0,cv.width,cv.height);
    pts.forEach(p=>{p.x+=p.sx;p.y+=p.sy;p.op=Math.max(0,Math.min(0.5,p.op+(Math.random()-0.5)*0.02));
      if(p.x<0)p.x=cv.width;if(p.x>cv.width)p.x=0;if(p.y<0)p.y=cv.height;if(p.y>cv.height)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fillStyle=`rgba(139,0,0,${p.op})`;ctx.fill();
    });
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
      const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
      if(d<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(139,0,0,${0.1*(1-d/120)})`;ctx.lineWidth=0.5;ctx.stroke();}
    }
    requestAnimationFrame(anim);
  })();
}

// ═══════════════════════════════════════════════════════
// CURSOR TRAIL
// ═══════════════════════════════════════════════════════

function initCursorTrail(){
  const t=document.createElement('div');t.className='cursor-trail';document.body.appendChild(t);
  let mx=0,my=0,tx=0,ty=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;t.style.opacity='0.6';});
  document.addEventListener('mouseleave',()=>{t.style.opacity='0';});
  (function a(){tx+=(mx-tx)*0.15;ty+=(my-ty)*0.15;t.style.left=tx+'px';t.style.top=ty+'px';requestAnimationFrame(a);})();
}

// ═══════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════

function escapeHTML(str){const d=document.createElement('div');d.textContent=str;return d.innerHTML;}

// ═══════════════════════════════════════════════════════
// AUTH SYSTEM — Login / Signup / Sessions
// ═══════════════════════════════════════════════════════

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
}

function generateSessionToken() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function getAllUsers() {
  try { return JSON.parse(localStorage.getItem('escaperoom_users')) || {}; } catch { return {}; }
}
function saveAllUsers(users) { localStorage.setItem('escaperoom_users', JSON.stringify(users)); }

function createDefaultProfile(username) {
  return {
    username,
    password: '',
    premiumStatus: false,
    coins: 50,
    levelReached: 1,
    totalPlayTime: 0,
    totalEscapes: 0,
    achievements: [],
    inventory: [],
    multiplayerRank: 'Unranked',
    mpWins: 0,
    mpGames: 0,
    lastLogin: new Date().toISOString(),
    joinedDate: new Date().toISOString(),
    activity: [],
    avatar: '💀'
  };
}

function registerUser() {
  const usernameEl = document.getElementById('signupUsername');
  const passwordEl = document.getElementById('signupPassword');
  const confirmEl = document.getElementById('signupConfirm');
  const errorEl = document.getElementById('signupError');

  const username = usernameEl.value.trim();
  const password = passwordEl.value;
  const confirm = confirmEl.value;

  errorEl.textContent = '';

  if (!username || username.length < 3) { errorEl.textContent = 'Username must be at least 3 characters.'; return; }
  if (/[^a-zA-Z0-9_]/.test(username)) { errorEl.textContent = 'Username: only letters, numbers, underscores.'; return; }
  if (password.length < 4) { errorEl.textContent = 'Password must be at least 4 characters.'; return; }
  if (password !== confirm) { errorEl.textContent = 'Passwords do not match.'; return; }

  const users = getAllUsers();
  if (users[username.toLowerCase()]) { errorEl.textContent = 'Username already taken.'; return; }

  const profile = createDefaultProfile(username);
  profile.password = simpleHash(password);
  users[username.toLowerCase()] = profile;
  saveAllUsers(users);

  AudioEngine.init(); AudioEngine.achievement();

  // Auto-login
  saveSession(username);
  addActivity(username, '🎮 Account created');
  onAuthSuccess(username);
}

function loginUser() {
  const usernameEl = document.getElementById('loginUsername');
  const passwordEl = document.getElementById('loginPassword');
  const errorEl = document.getElementById('loginError');

  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  errorEl.textContent = '';

  if (!username || !password) { errorEl.textContent = 'Enter username and password.'; return; }

  const users = getAllUsers();
  const profile = users[username.toLowerCase()];

  if (!profile || profile.password !== simpleHash(password)) {
    errorEl.textContent = 'Invalid username or password.';
    return;
  }

  AudioEngine.init(); AudioEngine.correct();

  profile.lastLogin = new Date().toISOString();
  saveAllUsers(users);
  saveSession(username);
  addActivity(username, '🔓 Logged in');
  onAuthSuccess(username);
}

function logoutUser() {
  AudioEngine.click();
  const user = getCurrentUser();
  if (user) addActivity(user, '🚪 Logged out');
  clearSession();
  stopInactivityTimer();
  if (STATE.gameActive) { stopTimer(); AudioEngine.stopAmbient(); STATE.gameActive = false; }
  // Clear the player name input so the next user starts fresh
  const nameInput = document.getElementById('playerName');
  if (nameInput) nameInput.value = '';
  // Refresh lock overlays & pricing buttons to reflect no-user state
  refreshLockOverlays();
  updatePricingButtons();
  document.getElementById('authScreen').classList.remove('hidden');
  document.body.classList.remove('theme-mansion','theme-asylum','theme-catacombs','theme-quantum','theme-cyberpunk','theme-underwater','theme-victorian','theme-spacestation','theme-temple','theme-hackervault');
  // Reset nav to home
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const homeSection = document.getElementById('home');
  if (homeSection) homeSection.classList.add('active');
  STATE.currentSection = 'home';
}

function confirmLogout() {
  AudioEngine.click();
  if (confirm('Are you sure you want to log out? Your progress is saved.')) {
    logoutUser();
  }
}

function saveSession(username) {
  const session = {
    username: username.toLowerCase(),
    displayName: username,
    token: generateSessionToken(),
    created: Date.now(),
    lastActive: Date.now()
  };
  localStorage.setItem('escaperoom_session', JSON.stringify(session));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('escaperoom_session')); } catch { return null; }
}

function clearSession() {
  localStorage.removeItem('escaperoom_session');
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  // 30-minute inactivity check
  if (Date.now() - session.lastActive > 30 * 60 * 1000) {
    clearSession();
    return null;
  }
  return session.displayName;
}

function touchSession() {
  const session = getSession();
  if (session) {
    session.lastActive = Date.now();
    localStorage.setItem('escaperoom_session', JSON.stringify(session));
  }
}

function getUserProfile(username) {
  if (!username) return null;
  const users = getAllUsers();
  return users[username.toLowerCase()] || null;
}

function saveUserProfile(username, profile) {
  const users = getAllUsers();
  users[username.toLowerCase()] = profile;
  saveAllUsers(users);
}

function addActivity(username, message) {
  const profile = getUserProfile(username);
  if (!profile) return;
  profile.activity = profile.activity || [];
  profile.activity.unshift({ msg: message, time: new Date().toISOString() });
  if (profile.activity.length > 30) profile.activity = profile.activity.slice(0, 30);
  saveUserProfile(username, profile);
}

function onAuthSuccess(username) {
  document.getElementById('authScreen').classList.add('hidden');
  // Auto-fill the player name input with the logged-in username
  const nameInput = document.getElementById('playerName');
  if (nameInput) nameInput.value = username;
  updateNavUserInfo();
  startInactivityTimer();
  // Render sections that need data
  renderDashboard();
  renderProfile();
  refreshLockOverlays();
  updatePricingButtons();
}

function showAuthPanel(panel) {
  document.getElementById('loginPanel').classList.toggle('hidden', panel !== 'login');
  document.getElementById('signupPanel').classList.toggle('hidden', panel !== 'signup');
  document.getElementById('loginError').textContent = '';
  document.getElementById('signupError').textContent = '';
}

function togglePasswordVis(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁️'; }
}

function checkPasswordStrength() {
  const pw = document.getElementById('signupPassword').value;
  const bar = document.getElementById('pwStrength');
  let score = 0;
  if (pw.length >= 4) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  const colors = ['#c62828', '#e65100', '#ff8f00', '#2e7d32', '#1b5e20'];
  const widths = ['20%', '40%', '60%', '80%', '100%'];
  const idx = Math.min(score, 4);
  bar.style.width = widths[idx];
  bar.style.background = colors[idx];
}

function updateNavUserInfo() {
  const user = getCurrentUser();
  const profile = getUserProfile(user);
  const navCoins = document.getElementById('navCoins');
  const navUsername = document.getElementById('navUsername');
  if (profile) {
    navCoins.textContent = `🪙 ${profile.coins}`;
    navUsername.textContent = profile.username;
  } else {
    navCoins.textContent = '🪙 0';
    navUsername.textContent = 'Guest';
  }
}

// ═══════════════════════════════════════════════════════
// INACTIVITY TIMER — Auto-logout after 30 min
// ═══════════════════════════════════════════════════════

let inactivityTimerId = null;
const INACTIVITY_LIMIT = 30 * 60 * 1000;

function startInactivityTimer() {
  stopInactivityTimer();
  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  const resetTimer = () => {
    touchSession();
    clearTimeout(inactivityTimerId);
    inactivityTimerId = setTimeout(() => {
      alert('Session expired due to inactivity.');
      logoutUser();
    }, INACTIVITY_LIMIT);
  };
  events.forEach(ev => document.addEventListener(ev, resetTimer, { passive: true }));
  resetTimer();
}

function stopInactivityTimer() {
  if (inactivityTimerId) { clearTimeout(inactivityTimerId); inactivityTimerId = null; }
}

// ═══════════════════════════════════════════════════════
// DASHBOARD RENDERER
// ═══════════════════════════════════════════════════════

function renderDashboard() {
  const user = getCurrentUser();
  const profile = getUserProfile(user);
  if (!profile) return;

  document.getElementById('dashCoins').textContent = profile.coins;
  document.getElementById('dashEscapes').textContent = profile.totalEscapes || 0;
  document.getElementById('dashRank').textContent = profile.multiplayerRank || 'Unranked';

  const mins = Math.floor((profile.totalPlayTime || 0) / 60);
  const hrs = Math.floor(mins / 60);
  const rm = mins % 60;
  document.getElementById('dashPlaytime').textContent = hrs > 0 ? `${hrs}h ${rm}m` : `${mins}m`;

  // Activity
  const actEl = document.getElementById('dashActivity');
  if (profile.activity && profile.activity.length > 0) {
    actEl.innerHTML = profile.activity.slice(0, 15).map(a => {
      const t = new Date(a.time);
      const ts = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' · ' +
                 t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `<div class="dash-activity-item">${a.msg} <span class="act-time">${ts}</span></div>`;
    }).join('');
  } else {
    actEl.innerHTML = '<div class="dash-activity-empty">No recent activity. Start playing to build your legend!</div>';
  }
}

// ═══════════════════════════════════════════════════════
// PROFILE RENDERER
// ═══════════════════════════════════════════════════════

function renderProfile() {
  const user = getCurrentUser();
  const profile = getUserProfile(user);
  if (!profile) return;

  document.getElementById('profileAvatar').textContent = profile.avatar || '💀';
  document.getElementById('profileName').textContent = profile.username;

  const jd = new Date(profile.joinedDate || Date.now());
  document.getElementById('profileJoined').textContent = 'Joined: ' + jd.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const premBadge = document.getElementById('profilePremiumBadge');
  const avatarEl = document.getElementById('profileAvatar');
  const premBtn = document.getElementById('premiumActionBtn');
  if (profile.premiumStatus) {
    premBadge.classList.remove('hidden');
    avatarEl.classList.add('premium-frame');
    premBtn.textContent = '👑 Premium Active';
    premBtn.disabled = true;
  } else {
    premBadge.classList.add('hidden');
    avatarEl.classList.remove('premium-frame');
    premBtn.textContent = '👑 Upgrade to Premium';
    premBtn.disabled = false;
  }

  document.getElementById('profCoins').textContent = profile.coins;
  document.getElementById('profLevel').textContent = profile.levelReached || 1;
  document.getElementById('profEscapes').textContent = profile.totalEscapes || 0;
  document.getElementById('profRank').textContent = profile.multiplayerRank || '—';

  const mins = Math.floor((profile.totalPlayTime || 0) / 60);
  document.getElementById('profPlaytime').textContent = mins > 60 ? `${Math.floor(mins/60)}h ${mins%60}m` : `${mins}m`;

  const earned = getEarnedBadges();
  document.getElementById('profBadges').textContent = earned.length;

  // Achievements
  const achList = document.getElementById('profAchList');
  if (profile.achievements && profile.achievements.length > 0) {
    achList.innerHTML = profile.achievements.slice(0, 10).map(a =>
      `<span class="profile-ach-item">${a}</span>`
    ).join('');
  } else {
    achList.innerHTML = 'No achievements yet.';
  }

  // Inventory
  const invGrid = document.getElementById('profInventory');
  if (profile.inventory && profile.inventory.length > 0) {
    invGrid.innerHTML = profile.inventory.map(item =>
      `<div class="profile-inv-item">${item}</div>`
    ).join('');
  } else {
    invGrid.innerHTML = 'Empty';
  }
}

// ═══════════════════════════════════════════════════════
// PREMIUM SYSTEM
// ═══════════════════════════════════════════════════════

function openPremiumModal() {
  AudioEngine.click();
  document.getElementById('premiumModal').classList.remove('hidden');
}

function closePremiumModal() {
  AudioEngine.click();
  document.getElementById('premiumModal').classList.add('hidden');
}

function confirmPremiumUpgrade() {
  const user = getCurrentUser();
  const profile = getUserProfile(user);
  if (!profile) return;

  const btn = document.getElementById('premiumUpgradeBtn');
  btn.disabled = true;
  btn.innerHTML = '⏳ Processing...';

  AudioEngine.achievement();

  setTimeout(() => {
    profile.premiumStatus = true;
    profile.coins += 500;
    profile.achievements = profile.achievements || [];
    if (!profile.achievements.includes('👑 Premium Member')) {
      profile.achievements.push('👑 Premium Member');
    }
    saveUserProfile(user, profile);
    addActivity(user, '👑 Upgraded to Premium');

    btn.innerHTML = '✅ Upgraded!';
    btn.style.background = 'linear-gradient(135deg, #2e7d32, #43a047)';

    setTimeout(() => {
      closePremiumModal();
      btn.disabled = false;
      btn.innerHTML = '👑 Upgrade Now';
      btn.style.background = '';
      renderProfile();
      renderDashboard();
      updateNavUserInfo();
    }, 1200);
  }, 1500);
}

function isUserPremium() {
  const user = getCurrentUser();
  const profile = getUserProfile(user);
  return profile ? profile.premiumStatus === true : false;
}

// ═══════════════════════════════════════════════════════
// MULTIPLAYER SYSTEM — Simulated Frontend
// ═══════════════════════════════════════════════════════

let MP_STATE = {
  currentRoom: null,
  syncInterval: null,
  isReady: false
};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getAllRooms() {
  try { return JSON.parse(localStorage.getItem('escaperoom_mp_rooms')) || {}; } catch { return {}; }
}
function saveAllRooms(rooms) { localStorage.setItem('escaperoom_mp_rooms', JSON.stringify(rooms)); }

function createRoom() {
  const user = getCurrentUser();
  if (!user) return;

  const theme = document.getElementById('mpThemeSelect').value;
  const errEl = document.getElementById('mpError');
  errEl.textContent = '';

  // Premium gate for non-mansion themes
  if (theme !== 'mansion' && !isUserPremium()) {
    errEl.textContent = '⚠️ Premium required for Asylum & Catacombs multiplayer. Upgrade below!';
    return;
  }

  AudioEngine.click();

  const code = generateRoomCode();
  const td = THEME_DATA[theme];
  const room = {
    roomID: code,
    host: user,
    theme: theme,
    themeName: td ? td.name : theme,
    themeIcon: td ? td.icon : '🏚️',
    players: [
      { name: user, ready: false, avatar: getUserProfile(user)?.avatar || '💀', isHost: true }
    ],
    maxPlayers: 4,
    gameStarted: false,
    sharedInventory: [],
    puzzlesSolved: 0,
    totalPuzzles: td ? td.puzzles.length : 5,
    timer: td ? td.time : 600,
    chat: [{ type: 'system', msg: `Room created by ${user}`, time: Date.now() }],
    createdAt: Date.now()
  };

  const rooms = getAllRooms();
  rooms[code] = room;
  saveAllRooms(rooms);

  MP_STATE.currentRoom = code;
  MP_STATE.isReady = false;
  addActivity(user, `🏠 Created MP room [${code}]`);

  showRoomView(room);
  startMPSync();
}

function joinRoom(codeOverride) {
  const user = getCurrentUser();
  if (!user) return;

  const errEl = document.getElementById('mpError');
  errEl.textContent = '';

  const code = (codeOverride || document.getElementById('mpJoinCode').value.trim()).toUpperCase();
  if (!code || code.length !== 6) { errEl.textContent = '⚠️ Enter a valid 6-character room code.'; return; }

  const rooms = getAllRooms();
  const room = rooms[code];
  if (!room) { errEl.textContent = '❌ Room not found.'; return; }
  if (room.gameStarted) { errEl.textContent = '❌ Game already in progress.'; return; }
  if (room.players.length >= room.maxPlayers) { errEl.textContent = '❌ Room is full.'; return; }
  if (room.players.find(p => p.name === user)) { errEl.textContent = '⚠️ You are already in this room.'; return; }

  // Premium gate
  if (room.theme !== 'mansion' && !isUserPremium()) {
    errEl.textContent = '⚠️ Premium required to join Asylum & Catacombs rooms.';
    return;
  }

  AudioEngine.click();

  room.players.push({ name: user, ready: false, avatar: getUserProfile(user)?.avatar || '💀', isHost: false });
  room.chat.push({ type: 'system', msg: `${user} joined the room`, time: Date.now() });
  saveAllRooms(rooms);

  MP_STATE.currentRoom = code;
  MP_STATE.isReady = false;
  addActivity(user, `🔗 Joined MP room [${code}]`);

  showRoomView(room);
  startMPSync();
}

function leaveRoom() {
  const user = getCurrentUser();
  const code = MP_STATE.currentRoom;
  if (!code) return;

  AudioEngine.click();
  stopMPSync();

  const rooms = getAllRooms();
  const room = rooms[code];
  if (room) {
    room.players = room.players.filter(p => p.name !== user);
    room.chat.push({ type: 'system', msg: `${user} left the room`, time: Date.now() });
    if (room.players.length === 0) {
      delete rooms[code];
    } else if (room.host === user) {
      room.host = room.players[0].name;
      room.players[0].isHost = true;
      room.chat.push({ type: 'system', msg: `${room.host} is now the host`, time: Date.now() });
    }
    saveAllRooms(rooms);
  }

  MP_STATE.currentRoom = null;
  MP_STATE.isReady = false;
  addActivity(user, `🚪 Left MP room [${code}]`);

  showLobbyView();
  renderRoomsList();
}

function toggleReady() {
  const user = getCurrentUser();
  const code = MP_STATE.currentRoom;
  if (!code) return;

  AudioEngine.click();
  MP_STATE.isReady = !MP_STATE.isReady;

  const rooms = getAllRooms();
  const room = rooms[code];
  if (room) {
    const p = room.players.find(pl => pl.name === user);
    if (p) p.ready = MP_STATE.isReady;
    room.chat.push({ type: 'system', msg: `${user} is ${MP_STATE.isReady ? 'ready' : 'not ready'}`, time: Date.now() });
    saveAllRooms(rooms);
  }

  const btn = document.getElementById('mpReadyBtn');
  btn.textContent = MP_STATE.isReady ? '✅ Ready!' : '✋ Ready';
  btn.style.background = MP_STATE.isReady ? 'linear-gradient(135deg, #2e7d32, #43a047)' : '';

  syncRoomState();
}

function sendChatMessage() {
  const user = getCurrentUser();
  const code = MP_STATE.currentRoom;
  if (!code) return;

  const input = document.getElementById('mpChatInput');
  const msg = input.value.trim();
  if (!msg) return;

  AudioEngine.click();
  input.value = '';

  const rooms = getAllRooms();
  const room = rooms[code];
  if (room) {
    room.chat.push({ type: 'user', author: user, msg, time: Date.now() });
    if (room.chat.length > 100) room.chat = room.chat.slice(-100);
    saveAllRooms(rooms);
  }

  syncRoomState();
}

function startMPSync() {
  stopMPSync();
  MP_STATE.syncInterval = setInterval(syncRoomState, 1000);
}

function stopMPSync() {
  if (MP_STATE.syncInterval) { clearInterval(MP_STATE.syncInterval); MP_STATE.syncInterval = null; }
}

function syncRoomState() {
  const code = MP_STATE.currentRoom;
  if (!code) return;

  const rooms = getAllRooms();
  const room = rooms[code];
  if (!room) { showLobbyView(); stopMPSync(); return; }

  const user = getCurrentUser();

  // If the game has started, redirect all players (not just host) to the game
  if (room.gameStarted) {
    console.log('Game started! Redirecting player to game...');
    stopMPSync();
    
    // Store active MP game info for syncing during gameplay
    localStorage.setItem('escaperoom_active_mp', JSON.stringify({
      roomCode: code,
      theme: room.theme,
      players: room.players.map(p => p.name),
      startTime: room.gameStartTime || Date.now()
    }));
    
    MP_STATE.currentRoom = null;
    MP_STATE.isReady = false;
    STATE.isMultiplayer = true;
    STATE.mpRoomCode = code;
    selectRoom(room.theme);
    return;
  }

  // Update header
  document.getElementById('mpRoomTitle').textContent = `${room.themeIcon} ${room.themeName}`;
  document.getElementById('mpRoomCode').textContent = room.roomID;
  document.getElementById('mpRoomTheme').textContent = `${room.themeIcon} ${room.themeName}`;
  document.getElementById('mpRoomTimer').textContent = formatTime(room.timer);
  document.getElementById('mpPlayerCount').textContent = `(${room.players.length}/${room.maxPlayers})`;

  // Players
  const playerList = document.getElementById('mpPlayerList');
  playerList.innerHTML = room.players.map(p => {
    let classes = 'mp-player-card';
    if (p.isHost) classes += ' host';
    if (p.ready) classes += ' ready';
    const statusText = p.isHost ? '👑 Host' : (p.ready ? '✅ Ready' : '⏳ Waiting');
    const statusClass = p.ready ? 'mp-player-status ready-status' : 'mp-player-status';
    return `<div class="${classes}">
      <span class="mp-player-avatar">${p.avatar}</span>
      <div>
        <div class="mp-player-name">${escapeHTML(p.name)}</div>
        <div class="${statusClass}">${statusText}</div>
      </div>
    </div>`;
  }).join('');

  // Progress
  document.getElementById('mpProgressBar').style.width = room.totalPuzzles > 0 ? `${(room.puzzlesSolved / room.totalPuzzles) * 100}%` : '0%';
  document.getElementById('mpProgressText').textContent = `${room.puzzlesSolved} / ${room.totalPuzzles} puzzles solved`;

  // Chat
  const chatEl = document.getElementById('mpChatMessages');
  chatEl.innerHTML = room.chat.slice(-50).map(c => {
    if (c.type === 'system') return `<div class="mp-chat-msg"><span class="msg-system">⚙️ ${escapeHTML(c.msg)}</span></div>`;
    return `<div class="mp-chat-msg"><span class="msg-author">${escapeHTML(c.author)}:</span> ${escapeHTML(c.msg)}</div>`;
  }).join('');
  chatEl.scrollTop = chatEl.scrollHeight;

  // Show/hide start button (host only)
  const startBtn = document.getElementById('mpStartBtn');
  if (startBtn) {
    const nonHostPlayers = room.players.filter(p => !p.isHost);
    const allNonHostReady = nonHostPlayers.every(p => p.ready);
    
    console.log('syncRoomState - Host:', room.host, 'User:', user, 'isHost:', room.host === user);
    
    // Host can always see start button; enable when ready conditions met
    if (room.host === user) { 
      startBtn.classList.remove('mp-btn-hidden');
      startBtn.style.cssText = 'display: inline-block !important; visibility: visible !important;';
      if (nonHostPlayers.length === 0) {
        startBtn.textContent = '🚀 Start Solo';
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
      } else if (allNonHostReady) {
        startBtn.textContent = '🚀 Start Game';
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
      } else {
        startBtn.textContent = '⏳ Waiting...';
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
      }
    } else { 
      startBtn.classList.add('mp-btn-hidden');
      startBtn.style.cssText = 'display: none !important;';
    }
  }
}

function startMultiplayerGame() {
  const user = getCurrentUser();
  const code = MP_STATE.currentRoom;
  if (!code) { console.log('No MP room code'); return; }

  const rooms = getAllRooms();
  const room = rooms[code];
  if (!room) { console.log('Room not found:', code); return; }
  if (room.host !== user) { console.log('Not the host'); return; }

  AudioEngine.achievement();
  room.gameStarted = true;
  room.gameStartTime = Date.now();
  room.chat.push({ type: 'system', msg: '🚀 Game started! Good luck, survivors!', time: Date.now() });
  saveAllRooms(rooms);

  addActivity(user, `🚀 Started MP game [${code}]`);

  // Store active MP game info for syncing during gameplay
  localStorage.setItem('escaperoom_active_mp', JSON.stringify({
    roomCode: code,
    theme: room.theme,
    players: room.players.map(p => p.name),
    startTime: Date.now()
  }));

  // Navigate to play section with the room's theme
  stopMPSync();
  STATE.isMultiplayer = true;
  STATE.mpRoomCode = code;
  selectRoom(room.theme);
}

function showRoomView(room) {
  document.getElementById('mpLobbyView').classList.add('hidden');
  document.getElementById('mpRoomView').classList.remove('hidden');
  // Immediately sync to show button without delay
  syncRoomState();
}

function showLobbyView() {
  document.getElementById('mpLobbyView').classList.remove('hidden');
  document.getElementById('mpRoomView').classList.add('hidden');
}

function renderRoomsList() {
  const rooms = getAllRooms();
  const container = document.getElementById('mpRoomsList');
  const entries = Object.values(rooms).filter(r => !r.gameStarted);

  // Clean up old rooms (> 2 hours)
  const now = Date.now();
  const allRooms = getAllRooms();
  let cleaned = false;
  for (const code in allRooms) {
    if (now - allRooms[code].createdAt > 2 * 60 * 60 * 1000) { delete allRooms[code]; cleaned = true; }
  }
  if (cleaned) saveAllRooms(allRooms);

  if (entries.length === 0) {
    container.innerHTML = '<div class="mp-empty">No active rooms. Create one to begin!</div>';
    return;
  }

  container.innerHTML = entries.map(r =>
    `<div class="mp-room-item">
      <div class="mp-room-item-info">
        <span class="mp-room-item-name">${r.themeIcon} ${r.themeName}</span>
        <span class="mp-room-item-meta">Host: ${escapeHTML(r.host)} · Code: ${r.roomID}</span>
      </div>
      <div style="display:flex;align-items:center;gap:0.8rem">
        <span class="mp-room-item-players">${r.players.length}/${r.maxPlayers}</span>
        <button class="btn btn-blood btn-sm" onclick="joinRoom('${r.roomID}')">Join</button>
      </div>
    </div>`
  ).join('');
}

// ═══════════════════════════════════════════════════════
// PERSISTENCE — Auto-save after key events
// ═══════════════════════════════════════════════════════

function saveAllUserData() {
  const user = getCurrentUser();
  if (!user) return;
  const profile = getUserProfile(user);
  if (!profile) return;
  saveUserProfile(user, profile);
  updateNavUserInfo();
}

function saveGameEndToProfile(escaped) {
  const user = getCurrentUser();
  if (!user) return;
  const profile = getUserProfile(user);
  if (!profile) return;

  // Update stats
  profile.totalPlayTime = (profile.totalPlayTime || 0) + STATE.timeElapsed;
  if (escaped) {
    profile.totalEscapes = (profile.totalEscapes || 0) + 1;
    profile.coins = (profile.coins || 0) + Math.floor(STATE.score / 10);
    const lvl = Math.floor((profile.totalEscapes || 0) / 2) + 1;
    if (lvl > (profile.levelReached || 1)) profile.levelReached = lvl;

    // Score multiplier for premium
    if (profile.premiumStatus) {
      profile.coins += Math.floor(STATE.score / 20); // bonus 50%
    }

    // Achievement for escaping
    const achText = `🏆 Escaped ${ACTIVE_THEME ? ACTIVE_THEME.name : 'Unknown'} (Score: ${STATE.score})`;
    profile.achievements = profile.achievements || [];
    profile.achievements.unshift(achText);
    if (profile.achievements.length > 20) profile.achievements = profile.achievements.slice(0, 20);

    // Inventory from game
    if (STATE.inventory && STATE.inventory.length > 0) {
      profile.inventory = profile.inventory || [];
      STATE.inventory.forEach(item => {
        if (!profile.inventory.includes(item)) profile.inventory.push(item);
      });
      if (profile.inventory.length > 30) profile.inventory = profile.inventory.slice(0, 30);
    }

    addActivity(user, `🏆 Escaped ${ACTIVE_THEME ? ACTIVE_THEME.name : 'Unknown'} — Score: ${STATE.score}`);
  } else {
    profile.coins = (profile.coins || 0) + 5; // small consolation
    addActivity(user, `💀 Failed ${ACTIVE_THEME ? ACTIVE_THEME.name : 'Unknown'}`);
  }

  // Update MP rank based on escapes
  const escapes = profile.totalEscapes || 0;
  if (escapes >= 20) profile.multiplayerRank = 'Legend';
  else if (escapes >= 15) profile.multiplayerRank = 'Master';
  else if (escapes >= 10) profile.multiplayerRank = 'Veteran';
  else if (escapes >= 5) profile.multiplayerRank = 'Skilled';
  else if (escapes >= 2) profile.multiplayerRank = 'Novice';
  else profile.multiplayerRank = 'Unranked';

  saveUserProfile(user, profile);
  updateNavUserInfo();
}

// ═══════════════════════════════════════════════════════
// GAME FX ENGINE — Advanced Visual Effects (Game Only)
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// CAMERA SHAKE SYSTEM
// ═══════════════════════════════════════════════════════

const CameraShake = {
  _active: false,

  /** intensity: 'light' | 'normal' | 'heavy' | 'violent' */
  shake(intensity = 'normal', duration) {
    if (this._active) return;
    this._active = true;
    const classMap = {
      light:   'screen-shake-light',
      normal:  'screen-shake',
      heavy:   'screen-shake-heavy',
      violent: 'screen-shake-violent'
    };
    const durMap = { light: 250, normal: 300, heavy: 500, violent: 700 };
    const cls = classMap[intensity] || classMap.normal;
    const ms = duration || durMap[intensity] || 300;

    document.body.classList.add(cls);
    setTimeout(() => {
      document.body.classList.remove(cls);
      this._active = false;
    }, ms);
  }
};

// ═══════════════════════════════════════════════════════
// JUMPSCARE SYSTEM — Theme-Specific Horror Events
// ═══════════════════════════════════════════════════════

const JumpscareEngine = {
  _cooldown: false,
  _lastScare: 0,
  _minInterval: 45000,   // minimum 45s between jumpscares
  _randomTimer: null,

  // Theme-specific jumpscare configs
  SCARES: {
    mansion: {
      faces: ['👻', '💀', '🧟', '😱', '👹'],
      texts: ['GET OUT...', 'YOU\'RE MINE', 'NEVER LEAVE', 'IT WATCHES', 'BEHIND YOU'],
      sound: (ae) => {
        // Deep rumble + ghost wail
        ae.playTone(50, 1.5, 'sawtooth', 0.25);
        ae.playTone(55, 1.2, 'sawtooth', 0.2, 10);
        setTimeout(() => {
          ae.playTone(800, 0.8, 'sine', 0.15, 30);
          ae.playTone(1200, 0.6, 'sine', 0.1, -20);
        }, 200);
        setTimeout(() => ae.playTone(2000, 0.4, 'sawtooth', 0.08), 400);
      }
    },
    asylum: {
      faces: ['🧟', '😈', '🤡', '👁️', '💉'],
      texts: ['PATIENT ZERO', 'NO ESCAPE', 'TREATMENT TIME', 'THE DOCTOR SEES', 'STAY FOREVER'],
      sound: (ae) => {
        // Electrical zap + hysterical laughter-like tones
        for (let i = 0; i < 8; i++) ae.playTone(100 + Math.random() * 300, 0.06, 'square', 0.12, i * 5);
        setTimeout(() => {
          ae.playTone(600, 0.5, 'sawtooth', 0.12, 40);
          ae.playTone(900, 0.3, 'square', 0.08, -30);
        }, 300);
        setTimeout(() => ae.playTone(1800, 0.4, 'sine', 0.06, 50), 500);
      }
    },
    catacombs: {
      faces: ['💀', '☠️', '🦴', '👻', '🕳️'],
      texts: ['THE BONES SPEAK', 'JOIN US BELOW', 'NO LIGHT HERE', 'LOST FOREVER', 'DEEPER...'],
      sound: (ae) => {
        // Stone grinding + deep moan
        ae.playTone(30, 2, 'sawtooth', 0.2);
        ae.playTone(35, 1.8, 'sine', 0.15, 8);
        for (let i = 0; i < 6; i++) setTimeout(() => ae.playTone(40 + Math.random() * 60, 0.15, 'sawtooth', 0.06), i * 100);
        setTimeout(() => ae.playTone(150, 1, 'sine', 0.08, -10), 400);
      }
    },
    quantum: {
      faces: ['⏳', '🌀', '👁️', '∞', '🕳️'],
      texts: ['TIME FRACTURE', 'LOOP BREAKING', 'YOU WERE HERE BEFORE', 'COLLAPSE', 'AGAIN...'],
      sound: (ae) => {
        // Time-warp dissonance
        ae.playTone(220, 1, 'sine', 0.12, 80);
        ae.playTone(223, 1, 'sine', 0.12, -80);
        setTimeout(() => {
          ae.playTone(440, 0.5, 'triangle', 0.08, 50);
          ae.playTone(110, 0.8, 'sine', 0.1, -40);
        }, 300);
        setTimeout(() => ae.playTone(60, 1.5, 'sawtooth', 0.15), 500);
      }
    },
    cyberpunk: {
      faces: ['🤖', '👁️', '💀', '⚡', '🔴'],
      texts: ['SYSTEM BREACH', 'AI AWAKENS', 'YOU ARE DATA', 'FIREWALL DOWN', 'CORRUPTED'],
      sound: (ae) => {
        // Digital glitch + power surge
        for (let i = 0; i < 12; i++) setTimeout(() => ae.playTone(800 + Math.random() * 4000, 0.03, 'square', 0.08), i * 20);
        setTimeout(() => {
          ae.playTone(60, 0.8, 'sawtooth', 0.15);
          ae.playTone(120, 0.6, 'square', 0.1, 5);
        }, 250);
        setTimeout(() => ae.playTone(2000, 0.15, 'square', 0.12), 400);
      }
    },
    underwater: {
      faces: ['🐙', '🦈', '👁️', '🌊', '💀'],
      texts: ['IT RISES', 'PRESSURE CRITICAL', 'FROM THE DEEP', 'HULL BREACH', 'DROWNING...'],
      sound: (ae) => {
        // Deep pressure + sonar ping + creature moan
        ae.playTone(20, 2.5, 'sine', 0.2);
        ae.playTone(25, 2, 'sine', 0.15, 6);
        setTimeout(() => {
          ae.playTone(2400, 0.08, 'sine', 0.12);
          setTimeout(() => ae.playTone(2200, 0.06, 'sine', 0.08), 200);
        }, 300);
        setTimeout(() => ae.playTone(80, 1.5, 'sawtooth', 0.1, -5), 600);
      }
    },
    victorian: {
      faces: ['👻', '🪆', '😱', '🕯️', '💀'],
      texts: ['THEY LINGER', 'BEHIND THE WALL', 'THE CHILDREN PLAY', 'DON\'T LOOK BACK', 'CREAK...'],
      sound: (ae) => {
        // Victorian creak + child laugh-like + music box
        for (let i = 0; i < 10; i++) setTimeout(() => ae.playTone(80 + Math.random() * 180, 0.12, 'sawtooth', 0.06), i * 50);
        setTimeout(() => {
          ae.playTone(523, 0.3, 'sine', 0.06);
          ae.playTone(659, 0.25, 'sine', 0.04);
          ae.playTone(784, 0.2, 'sine', 0.03);
        }, 400);
        setTimeout(() => ae.playTone(40, 1.5, 'sawtooth', 0.12), 200);
      }
    },
    spacestation: {
      faces: ['🛸', '👽', '🔴', '💀', '⚠️'],
      texts: ['CONTAINMENT FAIL', 'IT\'S ABOARD', 'LIFE SIGNS: 0', 'OXYGEN GONE', 'REACTOR CRITICAL'],
      sound: (ae) => {
        // Alarm blare + metallic clang + hiss
        ae.playTone(800, 0.3, 'square', 0.12);
        setTimeout(() => ae.playTone(600, 0.3, 'square', 0.12), 300);
        setTimeout(() => ae.playTone(800, 0.3, 'square', 0.12), 600);
        setTimeout(() => {
          ae.playTone(90, 0.08, 'square', 0.15);
          ae.playTone(60, 0.3, 'sawtooth', 0.1);
        }, 150);
        setTimeout(() => ae.playTone(3000, 0.5, 'sine', 0.04, 10), 500);
      }
    },
    temple: {
      faces: ['🗿', '👁️', '🐍', '💀', '🔥'],
      texts: ['THE CURSE AWAKENS', 'UNWORTHY', 'TURN BACK NOW', 'THE GODS WATCH', 'SACRIFICE'],
      sound: (ae) => {
        // Deep gong + stone rumble + chant-like drone
        ae.playTone(65, 2, 'sine', 0.15);
        ae.playTone(130, 1.5, 'sine', 0.08, 4);
        setTimeout(() => {
          ae.playTone(50, 1.5, 'sawtooth', 0.1);
          for (let i = 0; i < 5; i++) setTimeout(() => ae.playTone(55 + Math.random() * 30, 0.2, 'sawtooth', 0.04), i * 100);
        }, 300);
        setTimeout(() => ae.playTone(200, 0.8, 'triangle', 0.06), 600);
      }
    },
    hackervault: {
      faces: ['💻', '🔴', '☠️', '👁️', '⚡'],
      texts: ['INTRUSION ALERT', 'TRACED', 'FIREWALL ACTIVE', 'DATA WIPED', 'IDENTITY STOLEN'],
      sound: (ae) => {
        // Data corruption + error beeps + static
        for (let i = 0; i < 15; i++) setTimeout(() => ae.playTone(1000 + Math.random() * 5000, 0.02, 'square', 0.06), i * 15);
        setTimeout(() => {
          ae.playTone(80, 0.6, 'sawtooth', 0.12);
          ae.playTone(82, 0.6, 'sawtooth', 0.1, 3);
        }, 200);
        setTimeout(() => {
          ae.playTone(1000, 0.1, 'square', 0.1);
          setTimeout(() => ae.playTone(500, 0.1, 'square', 0.1), 150);
        }, 400);
      }
    }
  },

  /** Trigger a full jumpscare: face + text + sound + shake */
  trigger(theme, options = {}) {
    if (this._cooldown) return;
    const now = Date.now();
    if (now - this._lastScare < this._minInterval) return;

    const config = this.SCARES[theme] || this.SCARES.mansion;
    const face = config.faces[Math.floor(Math.random() * config.faces.length)];
    const text = options.text || config.texts[Math.floor(Math.random() * config.texts.length)];
    const duration = options.duration || 1800;
    const shakeIntensity = options.shake || 'violent';

    this._cooldown = true;
    this._lastScare = now;

    // Elements
    const overlay = document.getElementById('jumpscareOverlay');
    const faceEl = document.getElementById('jumpscareFace');
    const textEl = document.getElementById('jumpscareText');
    const staticEl = document.getElementById('jumpscareStatic');
    if (!overlay || !faceEl) return;

    // Set content
    faceEl.textContent = face;
    textEl.textContent = text;

    // Play theme sound
    if (AudioEngine.enabled) {
      try { config.sound(AudioEngine); } catch (e) { /* skip */ }
    }

    // Camera shake
    CameraShake.shake(shakeIntensity, duration);

    // Show static noise
    if (staticEl) staticEl.classList.add('active');

    // Show overlay
    overlay.classList.add('active');
    // Reset face animation
    faceEl.style.animation = 'none';
    void faceEl.offsetWidth;
    faceEl.style.animation = '';

    // Hide after duration
    setTimeout(() => {
      overlay.classList.remove('active');
      if (staticEl) staticEl.classList.remove('active');
      this._cooldown = false;
    }, duration);
  },

  /** Mini jumpscare — quick flash, lighter effect */
  miniScare(theme) {
    if (this._cooldown) return;
    const config = this.SCARES[theme] || this.SCARES.mansion;
    const face = config.faces[Math.floor(Math.random() * config.faces.length)];

    this._cooldown = true;

    const overlay = document.getElementById('jumpscareOverlay');
    const faceEl = document.getElementById('jumpscareFace');
    const textEl = document.getElementById('jumpscareText');
    const staticEl = document.getElementById('jumpscareStatic');
    if (!overlay || !faceEl) { this._cooldown = false; return; }

    faceEl.textContent = face;
    textEl.textContent = '';

    // Quick whisper sound
    AudioEngine.whisper();
    CameraShake.shake('heavy', 400);

    if (staticEl) staticEl.classList.add('active');
    overlay.classList.add('active');
    faceEl.style.animation = 'none'; void faceEl.offsetWidth; faceEl.style.animation = '';

    setTimeout(() => {
      overlay.classList.remove('active');
      if (staticEl) staticEl.classList.remove('active');
      this._cooldown = false;
    }, 600);
  },

  /** Start random ambient jumpscares during gameplay */
  startRandomScares() {
    this.stopRandomScares();
    this._randomTimer = setInterval(() => {
      if (!STATE.gameActive) return;
      // Higher chance at lower sanity
      const sanityFactor = (100 - STATE.sanity) / 100;
      const chance = 0.03 + sanityFactor * 0.12; // 3-15% per check
      if (Math.random() < chance) {
        const theme = STATE.activeThemeKey || 'mansion';
        // 30% full scare, 70% mini scare
        if (Math.random() < 0.3 && STATE.sanity < 60) {
          this.trigger(theme, { shake: 'heavy', duration: 1500 });
          reduceSanity(5);
        } else {
          this.miniScare(theme);
          reduceSanity(2);
        }
      }
    }, 15000); // check every 15 seconds
  },

  stopRandomScares() {
    if (this._randomTimer) { clearInterval(this._randomTimer); this._randomTimer = null; }
  }
};

const GameFX = {
  _embers: [],
  _emberInterval: null,
  _particleCtx: null,
  _particleRAF: null,
  _particles: [],
  _comboCount: 0,
  _comboTimeout: null,
  _bloodDrips: [],
  _vignetteActive: false,

  // ── Initialize all game FX ──
  init() {
    this.initCinematic();
    this.initEmbers();
    this.initParticleCanvas();
    this.initBloodDrips();
    this.initVignette();
  },

  // ── Cleanup all FX ──
  cleanup() {
    this.stopEmbers();
    this.stopParticles();
    this.removeCinematic();
    this.removeBloodDrips();
    this._comboCount = 0;
    if (this._comboTimeout) clearTimeout(this._comboTimeout);
    const vig = document.getElementById('gameVignette');
    if (vig) vig.className = 'game-vignette';
    const crack = document.getElementById('sanityCrackOverlay');
    if (crack) crack.classList.remove('active');
  },

  // ── Cinematic Letterbox ──
  initCinematic() {
    const ga = document.getElementById('gameArea');
    if (ga) setTimeout(() => ga.classList.add('cinematic'), 500);
  },
  removeCinematic() {
    const ga = document.getElementById('gameArea');
    if (ga) ga.classList.remove('cinematic');
  },

  // ── Floating Embers ──
  initEmbers() {
    this.stopEmbers();
    const container = document.getElementById('gameEmbers');
    if (!container) return;
    container.innerHTML = '';
    const count = 15;
    for (let i = 0; i < count; i++) {
      this._createEmber(container, i * 400);
    }
  },
  _createEmber(container, delay) {
    setTimeout(() => {
      if (!STATE.gameActive) return;
      const ember = document.createElement('div');
      ember.className = 'game-ember';
      const x = Math.random() * 100;
      const y = 50 + Math.random() * 50;
      const dur = 4 + Math.random() * 6;
      const driftX = -30 + Math.random() * 60;
      const driftY = -(100 + Math.random() * 200);
      ember.style.cssText = `left:${x}%;top:${y}%;--duration:${dur}s;--drift-x:${driftX}px;--drift-y:${driftY}px;animation-delay:${Math.random()*2}s;`;
      container.appendChild(ember);
      this._embers.push(ember);
      // Recycle
      setTimeout(() => {
        if (ember.parentNode) ember.remove();
        const idx = this._embers.indexOf(ember);
        if (idx > -1) this._embers.splice(idx, 1);
        if (STATE.gameActive) this._createEmber(container, 0);
      }, dur * 1000 + 2000);
    }, delay);
  },
  stopEmbers() {
    const container = document.getElementById('gameEmbers');
    if (container) container.innerHTML = '';
    this._embers = [];
  },

  // ── Particle Canvas (Sparkle bursts) ──
  initParticleCanvas() {
    const canvas = document.getElementById('gameParticlesCanvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this._particleCtx = canvas.getContext('2d');
    this._particles = [];
    this._runParticleLoop();
    window.addEventListener('resize', () => {
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    });
  },
  _runParticleLoop() {
    const loop = () => {
      if (!STATE.gameActive) { this._particleCtx && this._particleCtx.clearRect(0, 0, 9999, 9999); return; }
      const ctx = this._particleCtx;
      if (!ctx) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (let i = this._particles.length - 1; i >= 0; i--) {
        const p = this._particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= p.decay;
        if (p.life <= 0) { this._particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        // glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      this._particleRAF = requestAnimationFrame(loop);
    };
    loop();
  },
  stopParticles() {
    if (this._particleRAF) cancelAnimationFrame(this._particleRAF);
    this._particles = [];
    const canvas = document.getElementById('gameParticlesCanvas');
    if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }
  },

  // ── Spawn Particles at Position ──
  spawnBurst(x, y, color, count) {
    if (!this._particleCtx) return;
    const colors = Array.isArray(color) ? color : [color];
    for (let i = 0; i < (count || 20); i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      this._particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.05 + Math.random() * 0.05,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.01 + Math.random() * 0.02
      });
    }
  },

  // ── Blood Drips from HUD ──
  initBloodDrips() {
    this.removeBloodDrips();
    const hud = document.querySelector('.horror-hud');
    if (!hud) return;
    for (let i = 0; i < 5; i++) {
      const drip = document.createElement('div');
      drip.className = 'blood-drip';
      drip.style.cssText = `left:${10 + Math.random() * 80}%;--drip-duration:${3 + Math.random() * 4}s;--drip-delay:${Math.random() * 5}s;`;
      hud.appendChild(drip);
      this._bloodDrips.push(drip);
    }
  },
  removeBloodDrips() {
    this._bloodDrips.forEach(d => d.remove());
    this._bloodDrips = [];
  },

  // ── Vignette (Sanity-based) ──
  initVignette() {
    this._vignetteActive = true;
  },
  updateVignette(sanity) {
    if (!this._vignetteActive) return;
    const vig = document.getElementById('gameVignette');
    const crack = document.getElementById('sanityCrackOverlay');
    if (!vig) return;
    if (sanity < 30) {
      vig.className = 'game-vignette critical';
      if (crack) crack.classList.add('active');
    } else if (sanity < 60) {
      vig.className = 'game-vignette intense';
      if (crack) crack.classList.remove('active');
    } else {
      vig.className = 'game-vignette';
      if (crack) crack.classList.remove('active');
    }
  },

  // ── Screen Flash ──
  flash(type) {
    const el = document.getElementById('gameFlash');
    if (!el) return;
    el.className = 'game-flash-overlay';
    void el.offsetWidth;
    el.className = `game-flash-overlay ${type}-flash`;
    setTimeout(() => { el.className = 'game-flash-overlay'; }, 600);
  },

  // ── Room Transition Wipe ──
  roomWipe(callback) {
    const el = document.getElementById('roomTransition');
    if (!el) { if (callback) callback(); return; }
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
    setTimeout(() => {
      if (callback) callback();
    }, 300);
    setTimeout(() => { el.classList.remove('active'); }, 700);
  },

  // ── Portal Effect (Room Navigation) ──
  portalEffect() {
    const portal = document.createElement('div');
    portal.className = 'room-portal-effect';
    document.body.appendChild(portal);
    setTimeout(() => portal.remove(), 700);
  },

  // ── Score Bump Animation ──
  scoreBump() {
    const el = document.getElementById('hudScore');
    if (!el) return;
    el.classList.remove('score-bump');
    void el.offsetWidth;
    el.classList.add('score-bump');
    setTimeout(() => el.classList.remove('score-bump'), 600);
  },

  // ── Floating Score Popup ──
  scorePopup(x, y, points) {
    const el = document.createElement('div');
    el.className = 'score-popup';
    el.textContent = `+${points}`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  },

  // ── Combo System ──
  registerCombo() {
    this._comboCount++;
    if (this._comboTimeout) clearTimeout(this._comboTimeout);
    this._comboTimeout = setTimeout(() => { this._comboCount = 0; }, 30000);
    if (this._comboCount >= 2) {
      const el = document.createElement('div');
      el.className = 'combo-indicator';
      el.textContent = `${this._comboCount}x COMBO!`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }
  },

  // ── Game Over / Victory Dramatic Effects ──
  gameOverEffect() {
    const pulse = document.createElement('div');
    pulse.className = 'game-over-pulse';
    document.body.appendChild(pulse);
    setTimeout(() => pulse.remove(), 2500);
    // Screen shake
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 500);
  },

  victoryEffect() {
    const shimmer = document.createElement('div');
    shimmer.className = 'game-victory-shimmer';
    document.body.appendChild(shimmer);
    setTimeout(() => shimmer.remove(), 3500);
    // Particle burst in center
    this.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, ['#ffd700', '#ffeb3b', '#ff9800', '#fff'], 50);
    // Additional bursts
    setTimeout(() => {
      this.spawnBurst(window.innerWidth * 0.3, window.innerHeight * 0.4, ['#ffd700', '#ffeb3b'], 25);
      this.spawnBurst(window.innerWidth * 0.7, window.innerHeight * 0.4, ['#ffd700', '#ffeb3b'], 25);
    }, 300);
  },

  // ── Room Title Glitch Data Attribute ──
  setRoomTitleGlitch(puzzleNum) {
    const titles = document.querySelectorAll('.horror-room-title');
    titles.forEach(t => {
      t.setAttribute('data-text', t.textContent);
    });
  },

  // ── Typewriter Clue Effect ──
  typewriterClue(element, text, speed) {
    if (!element) return;
    element.textContent = '';
    element.classList.add('typing');
    let i = 0;
    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed || 30);
      } else {
        element.classList.remove('typing');
      }
    };
    type();
  },

  // ── Inventory Collect Animation ──
  inventoryCollectFX(slotIndex) {
    const slot = document.getElementById(`invSlot${slotIndex}`);
    if (!slot) return;
    slot.classList.add('collecting');
    setTimeout(() => slot.classList.remove('collecting'), 700);
  }
};

// ═══════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded',()=>{
  initLoadingScreen();
  document.addEventListener('click',()=>{AudioEngine.init();AudioEngine.resume();},{once:true});

  const fm=document.getElementById('forumMessage');
  if(fm) fm.addEventListener('input',()=>{document.getElementById('forumCharCount').textContent=`${fm.value.length} / 500`;});

  createHeroParticles(); initHorrorCanvas(); init3DParallax(); initDragSystem(); initCursorTrail();
  setInterval(()=>{if(Math.random()<0.15) triggerLightning();},20000);
  renderBadgePage();
  refreshLockOverlays();
  updatePricingButtons();

  // Password strength listener
  const spw = document.getElementById('signupPassword');
  if (spw) spw.addEventListener('input', checkPasswordStrength);

  // Chat input Enter key
  const chatInp = document.getElementById('mpChatInput');
  if (chatInp) chatInp.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

  // Listen for localStorage changes from other tabs (multiplayer sync)
  window.addEventListener('storage', (e) => {
    if (e.key === 'escaperoom_mp_rooms' && MP_STATE.currentRoom) {
      syncRoomState();
    }
  });

  // Pre-fill player name from session
  const user = getCurrentUser();
  if (user) {
    document.getElementById('authScreen').classList.add('hidden');
    const pnInput = document.getElementById('playerName');
    if (pnInput && !pnInput.value) pnInput.value = user;
    updateNavUserInfo();
    startInactivityTimer();
  } else {
    document.getElementById('authScreen').classList.remove('hidden');
  }
});
