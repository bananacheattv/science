/* ============================================================
   BACTÉROQUEST — script.js
   Logique de jeu, animations canvas, quiz final
   Contenu basé sur le PDF : "Les bactéries face aux antibiotiques"
   ============================================================ */

// ============================================================
// GESTIONNAIRE PRINCIPAL DU JEU
// ============================================================
const Game = {
  score: 0,
  currentLevel: 0,
  unlockedLevels: [1],
  xpGoals: { 1: 50, 2: 40, 3: 50, 4: 60, 5: 60 },
  xpCurrent: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },

  startGame() {
    this.showScreen('screen-level1');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('level-nav').classList.remove('hidden');
    this.updateHUD(1);
    this.unlockNav(1);
    Level1.init();
  },

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const s = document.getElementById(id);
    if (s) s.classList.add('active');
  },

  goToLevel(n) {
    if (!this.unlockedLevels.includes(n)) return;
    this.currentLevel = n;
    this.showScreen('screen-level' + n);
    this.updateHUD(n);
    this.updateNavActive(n);
    // Init du niveau si nécessaire
    const inits = { 1: Level1.init, 2: Level2.init, 3: Level3.init, 4: Level4.init, 5: Level5.init };
    if (inits[n]) inits[n].call(inits[n] === Level1.init ? Level1 : (inits[n] === Level2.init ? Level2 : (inits[n] === Level3.init ? Level3 : (inits[n] === Level4.init ? Level4 : Level5))));
  },

  nextLevel() {
    const next = this.currentLevel + 1;
    if (next <= 5) {
      this.unlockedLevels.push(next);
      this.unlockNav(next);
      this.goToLevel(next);
      const levelInits = [null, Level1, Level2, Level3, Level4, Level5];
      if (levelInits[next]) levelInits[next].init();
    }
  },

  goQuiz() {
    this.showScreen('screen-quiz');
    document.getElementById('hud-level').textContent = 'Q';
    this.updateNavActive('Q');
    this.unlockNav('Q');
    Quiz.start();
  },

  addScore(points) {
    this.score += points;
    document.getElementById('hud-score').textContent = this.score;
  },

  addXP(level, points) {
    this.xpCurrent[level] = Math.min(this.xpGoals[level], (this.xpCurrent[level] || 0) + points);
    this.updateHUD(level);
    const pct = (this.xpCurrent[level] / this.xpGoals[level]) * 100;
    if (pct >= 100) {
      const btn = document.getElementById('btn-next' + level);
      if (btn) { btn.disabled = false; btn.classList.add('glow-pulse'); }
    }
  },

  updateHUD(level) {
    this.currentLevel = level;
    document.getElementById('hud-level').textContent = level;
    const xp = this.xpCurrent[level] || 0;
    const goal = this.xpGoals[level] || 100;
    document.getElementById('progress-bar').style.width = ((xp / goal) * 100) + '%';
    document.getElementById('progress-text').textContent = xp + ' / ' + goal + ' XP';
  },

  unlockNav(id) {
    const btn = document.getElementById('nav' + id);
    if (btn) btn.classList.add('unlocked');
  },

  updateNavActive(id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('nav' + id);
    if (btn) btn.classList.add('active');
  },

  showEnd(quizScore, total) {
    this.showScreen('screen-end');
    document.getElementById('hud').classList.add('hidden');
    const finalScore = this.score;
    document.getElementById('end-score').textContent = finalScore;
    let rank, msg;
    if (quizScore >= 8) {
      rank = '🌟 Expert en Microbiologie';
      msg = 'Impressionnant ! Tu maîtrises parfaitement les mécanismes d\'évolution bactérienne et les enjeux de l\'antibiorésistance.';
    } else if (quizScore >= 5) {
      rank = '🔬 Scientifique Confirmé';
      msg = 'Très bien ! Tu comprends les grandes lignes de la résistance bactérienne. Continue à approfondir tes connaissances !';
    } else {
      rank = '🧫 Apprenti Biologiste';
      msg = 'Bon début ! Relis le contenu des niveaux pour mieux comprendre les mécanismes d\'évolution des bactéries.';
    }
    document.getElementById('end-rank').textContent = rank;
    document.getElementById('end-message').textContent = msg + '\n\nQuiz : ' + quizScore + '/' + total + ' bonnes réponses.';
  },

  restart() {
    this.score = 0;
    this.currentLevel = 0;
    this.unlockedLevels = [1];
    this.xpCurrent = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    document.getElementById('hud-score').textContent = '0';
    document.querySelectorAll('.btn-next').forEach(b => { b.disabled = true; b.classList.remove('glow-pulse'); });
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('unlocked', 'active'));
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('level-nav').classList.add('hidden');
    this.showScreen('screen-home');
  }
};

// ============================================================
// NIVEAU 1 — Découverte des Bactéries (Canvas interactif)
// ============================================================
const Level1 = {
  canvas: null, ctx: null,
  bacteria: [],
  clicked: new Set(),
  animId: null,

  bacteriaInfos: [
    { name: 'Staphylococcus aureus', color: '#ffd60a', shape: 'round', info: '<h4>🦠 Staphylococcus aureus</h4><p>Bactérie sphérique (coque). Peut causer des infections cutanées, pulmonaires et sanguines. Le SARM en est une souche résistante très redoutée en milieu hospitalier.</p>' },
    { name: 'E. coli', color: '#00ff88', shape: 'rod', info: '<h4>🦠 Escherichia coli</h4><p>Bactérie en forme de bâtonnet (bacille). Présente dans nos intestins. Certaines souches sont résistantes aux antibiotiques de première intention dans plus de 50% des cas dans certains pays (OMS, 2023).</p>' },
    { name: 'Pseudomonas', color: '#00cfff', shape: 'rod', info: '<h4>🦠 Pseudomonas aeruginosa</h4><p>Bacille multirésistant. Cause des infections graves chez les patients immunodéprimés. Résiste à de nombreuses familles d\'antibiotiques simultanément.</p>' },
    { name: 'Bactérie mutante', color: '#ff4d6d', shape: 'round', info: '<h4>⚠️ Bactérie avec Mutation</h4><p>Une mutation spontanée s\'est produite lors de la réplication ADN. Cette bactérie peut produire une β-lactamase — une enzyme qui détruit la pénicilline. C\'est le début de la résistance !</p>' },
    { name: 'Salmonella', color: '#9b5de5', shape: 'rod', info: '<h4>🦠 Salmonella</h4><p>Transmise par les aliments (viande, œufs). Des souches résistantes ont été retrouvées dans la chaîne alimentaire, liées à l\'usage massif d\'antibiotiques dans les élevages intensifs.</p>' },
  ],

  init() {
    this.canvas = document.getElementById('canvas1');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bacteria = [];
    this.clicked.clear();
    if (this.animId) cancelAnimationFrame(this.animId);

    // Créer 5 bactéries aléatoires
    for (let i = 0; i < 5; i++) {
      const info = this.bacteriaInfos[i];
      this.bacteria.push({
        x: 60 + Math.random() * 360,
        y: 40 + Math.random() * 220,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: 18 + Math.random() * 10,
        angle: Math.random() * Math.PI * 2,
        aSpeed: (Math.random() - 0.5) * 0.03,
        ...info,
        pulse: 0,
        pulsing: false
      });
    }

    this.canvas.onclick = (e) => this.onClick(e);
    this.loop();
  },

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (let b of this.bacteria) {
      const dx = mx - b.x, dy = my - b.y;
      if (Math.sqrt(dx*dx + dy*dy) < b.r + 10) {
        b.pulsing = true;
        b.pulse = 1;
        if (!this.clicked.has(b.name)) {
          this.clicked.add(b.name);
          Game.addScore(10);
          Game.addXP(1, 10);
          this.showPopup(b.info);
        }
        break;
      }
    }
  },

  showPopup(content) {
    const popup = document.getElementById('info-popup');
    document.getElementById('popup-content').innerHTML = content;
    popup.classList.remove('hidden');
  },

  loop() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);

    // Fond grille microscopique
    ctx.strokeStyle = 'rgba(0,207,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < c.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

    for (let b of this.bacteria) {
      // Mouvement
      b.x += b.vx; b.y += b.vy; b.angle += b.aSpeed;
      if (b.x < b.r || b.x > c.width - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > c.height - b.r) b.vy *= -1;

      // Pulse animation
      if (b.pulsing) { b.pulse -= 0.05; if (b.pulse <= 0) b.pulsing = false; }

      const isClicked = this.clicked.has(b.name);
      const scale = 1 + (b.pulsing ? b.pulse * 0.3 : 0);

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.scale(scale, scale);

      // Halo
      const grad = ctx.createRadialGradient(0, 0, b.r * 0.5, 0, 0, b.r * 1.8);
      grad.addColorStop(0, b.color + '40');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, b.r * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Corps
      if (b.shape === 'round') {
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color + (isClicked ? 'cc' : '99');
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = isClicked ? 3 : 1.5;
        ctx.stroke();
        // Flagelle
        ctx.beginPath();
        ctx.moveTo(b.r, 0);
        ctx.bezierCurveTo(b.r + 15, -10, b.r + 25, 10, b.r + 35, 0);
        ctx.strokeStyle = b.color + '80';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Bacille (bâtonnet)
        ctx.beginPath();
        const w = b.r * 0.65, h = b.r * 1.5;
        ctx.roundRect(-w, -h, w*2, h*2, w);
        ctx.fillStyle = b.color + (isClicked ? 'cc' : '99');
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = isClicked ? 3 : 1.5;
        ctx.stroke();
        // Flagelle
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.bezierCurveTo(10, h + 12, -10, h + 24, 0, h + 36);
        ctx.strokeStyle = b.color + '80';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Point intérieur (ADN)
      ctx.beginPath();
      ctx.arc(0, 0, b.r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();

      ctx.restore();

      // Label
      ctx.fillStyle = isClicked ? b.color : 'rgba(255,255,255,0.4)';
      ctx.font = isClicked ? 'bold 10px Exo 2' : '9px Exo 2';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, b.x, b.y + b.r + 14);
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
};

function closePopup() {
  document.getElementById('info-popup').classList.add('hidden');
}

// ============================================================
// NIVEAU 2 — Multiplication bactérienne
// ============================================================
const Level2 = {
  canvas: null, ctx: null,
  bacteria: [],
  divisions: 0,
  animId: null,

  init() {
    this.canvas = document.getElementById('canvas2');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bacteria = [];
    this.divisions = 0;
    if (this.animId) cancelAnimationFrame(this.animId);
    document.getElementById('division-count').textContent = 'Divisions : 0';

    // Une bactérie de départ
    this.bacteria.push(this.newBacteria(240, 150, '#00ff88'));
    this.loop();
  },

  newBacteria(x, y, color) {
    return {
      x, y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: 14,
      color,
      age: 0,
      dividing: false,
      divProgress: 0,
      hasMutation: Math.random() < 0.15 // 15% de chance de mutation
    };
  },

  divideBacteria() {
    if (this.bacteria.length >= 32) {
      document.getElementById('division-count').textContent = 'Population maximale atteinte ! (32)';
      return;
    }
    const newGen = [];
    const parent = this.bacteria[Math.floor(Math.random() * this.bacteria.length)];
    parent.dividing = true;
    parent.divProgress = 0;

    setTimeout(() => {
      const mutColor = parent.hasMutation ? '#ff4d6d' : parent.color;
      newGen.push(this.newBacteria(parent.x + 20, parent.y + (Math.random()-0.5)*20, mutColor));
      this.bacteria.push(...newGen);
      parent.dividing = false;
      this.divisions++;
      document.getElementById('division-count').textContent = `Divisions : ${this.divisions} | Population : ${this.bacteria.length}`;
      Game.addScore(5);
      Game.addXP(2, 10);
      if (this.divisions >= 4) {
        document.getElementById('btn-next2').disabled = false;
        document.getElementById('btn-next2').classList.add('glow-pulse');
      }
    }, 600);
  },

  reset() {
    this.bacteria = [];
    this.divisions = 0;
    document.getElementById('division-count').textContent = 'Divisions : 0';
    document.getElementById('btn-next2').disabled = true;
    document.getElementById('btn-next2').classList.remove('glow-pulse');
    Game.xpCurrent[2] = 0;
    Game.updateHUD(2);
    this.bacteria.push(this.newBacteria(240, 150, '#00ff88'));
  },

  loop() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);

    // Fond grille
    ctx.strokeStyle = 'rgba(0,207,255,0.04)';
    for (let x = 0; x < c.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

    for (let b of this.bacteria) {
      b.x += b.vx; b.y += b.vy; b.age++;
      if (b.x < b.r || b.x > c.width - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > c.height - b.r) b.vy *= -1;
      if (b.dividing) b.divProgress = Math.min(1, b.divProgress + 0.05);

      ctx.save();
      ctx.translate(b.x, b.y);

      // Animation de division : étirer la bactérie
      const scaleX = b.dividing ? 1 + b.divProgress * 0.5 : 1;
      const scaleY = b.dividing ? 1 - b.divProgress * 0.3 : 1;

      // Halo mutation
      if (b.hasMutation) {
        ctx.beginPath();
        ctx.arc(0, 0, b.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,77,109,0.1)';
        ctx.fill();
      }

      ctx.scale(scaleX, scaleY);
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color + 'bb';
      ctx.fill();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Noyau (ADN)
      ctx.beginPath();
      ctx.arc(0, 0, b.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();

      ctx.restore();

      // Tag mutation
      if (b.hasMutation) {
        ctx.fillStyle = '#ff4d6d';
        ctx.font = 'bold 8px Exo 2';
        ctx.textAlign = 'center';
        ctx.fillText('MUTATION', b.x, b.y - b.r - 4);
      }
    }

    // Compteur population
    ctx.fillStyle = 'rgba(0,207,255,0.6)';
    ctx.font = 'bold 12px Orbitron';
    ctx.textAlign = 'left';
    ctx.fillText('Population : ' + this.bacteria.length, 10, 20);

    this.animId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================================
// NIVEAU 3 — Les Antibiotiques
// ============================================================
const Level3 = {
  canvas: null, ctx: null,
  bacteria: [],
  weapon: null,
  treated: 0,
  animId: null,
  particles: [],

  init() {
    this.canvas = document.getElementById('canvas3');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bacteria = [];
    this.weapon = null;
    this.treated = 0;
    this.particles = [];
    if (this.animId) cancelAnimationFrame(this.animId);

    for (let i = 0; i < 8; i++) {
      this.bacteria.push({
        x: 40 + Math.random() * 400,
        y: 30 + Math.random() * 240,
        vx: (Math.random()-0.5) * 1.2,
        vy: (Math.random()-0.5) * 1.2,
        r: 14,
        alive: true,
        stunned: false,
        stunTimer: 0,
        alpha: 1
      });
    }

    this.canvas.onclick = (e) => this.onClick(e);
    this.loop();
  },

  selectWeapon(type) {
    this.weapon = type;
    document.getElementById('btn-bacteriostatique').classList.toggle('selected', type === 'static');
    document.getElementById('btn-bactericide').classList.toggle('selected', type === 'kill');
    document.getElementById('weapon-selected').textContent = type === 'static' ? '🛡 Bactériostatique sélectionné' : '⚔️ Bactéricide sélectionné';
  },

  onClick(e) {
    if (!this.weapon) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (let b of this.bacteria) {
      if (!b.alive) continue;
      const dx = mx - b.x, dy = my - b.y;
      if (Math.sqrt(dx*dx + dy*dy) < b.r + 8) {
        if (this.weapon === 'kill') {
          // Bactéricide : explose la bactérie
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.particles.push({ x: b.x, y: b.y, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, life: 1, color: '#00ff88' });
          }
          b.alive = false;
          b.alpha = 0;
        } else {
          // Bactériostatique : bloque la bactérie
          b.stunned = true;
          b.stunTimer = 180;
          b.vx = 0; b.vy = 0;
        }
        this.treated++;
        Game.addScore(10);
        Game.addXP(3, 10);
        document.getElementById('weapon-selected').textContent = `✅ Traitées : ${this.treated}/5`;
        if (this.treated >= 5) {
          document.getElementById('btn-next3').disabled = false;
          document.getElementById('btn-next3').classList.add('glow-pulse');
        }
        break;
      }
    }
  },

  loop() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);

    // Fond
    ctx.strokeStyle = 'rgba(0,207,255,0.04)';
    for (let x = 0; x < c.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

    // Particules d'explosion
    this.particles = this.particles.filter(p => p.life > 0);
    for (let p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2,'0');
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.04;
    }

    // Bactéries
    for (let b of this.bacteria) {
      if (!b.alive) continue;
      b.x += b.vx; b.y += b.vy;
      if (b.x < b.r || b.x > c.width - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > c.height - b.r) b.vy *= -1;

      if (b.stunned) {
        b.stunTimer--;
        if (b.stunTimer <= 0) { b.stunned = false; b.vx = (Math.random()-0.5)*1.2; b.vy = (Math.random()-0.5)*1.2; }
      }

      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.translate(b.x, b.y);

      // Halo bleu pour bactériostatique
      if (b.stunned) {
        ctx.beginPath();
        ctx.arc(0, 0, b.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,207,255,0.2)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.stunned ? '#00cfff99' : '#ffd60a99';
      ctx.fill();
      ctx.strokeStyle = b.stunned ? '#00cfff' : '#ffd60a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Noyau
      ctx.beginPath();
      ctx.arc(0, 0, b.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();

      if (b.stunned) {
        ctx.fillStyle = '#00cfff';
        ctx.font = 'bold 8px Exo 2';
        ctx.textAlign = 'center';
        ctx.fillText('BLOQUÉE', 0, -b.r - 4);
      }
      ctx.restore();
    }

    // Instruction si aucune arme sélectionnée
    if (!this.weapon) {
      ctx.fillStyle = 'rgba(255,214,10,0.7)';
      ctx.font = '13px Exo 2';
      ctx.textAlign = 'center';
      ctx.fillText('← Sélectionne un antibiotique d\'abord !', c.width/2, c.height - 15);
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================================
// NIVEAU 4 — La Résistance aux Antibiotiques (Sélection naturelle)
// ============================================================
const Level4 = {
  canvas: null, ctx: null,
  bacteria: [],
  animId: null,
  generations: 0,
  antibioticActive: false,
  antibioticTimer: 0,
  particles: [],

  init() {
    this.canvas = document.getElementById('canvas4');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (this.animId) cancelAnimationFrame(this.animId);
    this.particles = [];
    this.generations = 0;
    this.reset();
  },

  reset() {
    this.bacteria = [];
    this.generations = 0;
    this.antibioticActive = false;
    this.antibioticTimer = 0;
    this.particles = [];
    // Créer une population mixte : 80% sensibles, 20% résistantes
    for (let i = 0; i < 16; i++) {
      const resistant = Math.random() < 0.2;
      this.bacteria.push({
        x: 30 + Math.random() * 420,
        y: 20 + Math.random() * 260,
        vx: (Math.random()-0.5) * 1.2,
        vy: (Math.random()-0.5) * 1.2,
        r: 12,
        resistant,
        alive: true,
        alpha: 1,
        dying: false,
        dyingTimer: 0
      });
    }
    document.getElementById('resistant-count').textContent = 'Résistantes : ' + this.bacteria.filter(b => b.resistant && b.alive).length;
    document.getElementById('btn-next4').disabled = true;
    document.getElementById('btn-next4').classList.remove('glow-pulse');
    if (this.animId) cancelAnimationFrame(this.animId);
    this.loop();
  },

  addAntibiotic() {
    if (this.antibioticActive) return;
    this.antibioticActive = true;
    this.antibioticTimer = 200;
    this.generations++;

    // Les bactéries sensibles commencent à mourir
    for (let b of this.bacteria) {
      if (b.alive && !b.resistant) {
        b.dying = true;
        b.dyingTimer = Math.random() * 80 + 20;
      }
    }

    setTimeout(() => {
      // Après le traitement : les résistantes se multiplient
      const survivors = this.bacteria.filter(b => b.alive && b.resistant);
      const newGen = [];
      for (let s of survivors) {
        if (this.bacteria.length + newGen.length < 30) {
          newGen.push({
            x: s.x + (Math.random()-0.5)*30,
            y: s.y + (Math.random()-0.5)*30,
            vx: (Math.random()-0.5)*1.2,
            vy: (Math.random()-0.5)*1.2,
            r: 12,
            resistant: true,
            alive: true,
            alpha: 0,
            dying: false,
            dyingTimer: 0
          });
        }
      }
      this.bacteria.push(...newGen);
      this.antibioticActive = false;

      const resistCount = this.bacteria.filter(b => b.resistant && b.alive).length;
      document.getElementById('resistant-count').textContent = `Génération ${this.generations} | Résistantes : ${resistCount}/${this.bacteria.filter(b=>b.alive).length}`;
      Game.addScore(15);
      Game.addXP(4, 20);

      if (this.generations >= 3 || resistCount > 5) {
        document.getElementById('btn-next4').disabled = false;
        document.getElementById('btn-next4').classList.add('glow-pulse');
      }
    }, 2500);
  },

  loop() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);

    // Fond antibiotique
    if (this.antibioticActive && this.antibioticTimer > 0) {
      this.antibioticTimer--;
      const intensity = (this.antibioticTimer / 200) * 0.15;
      ctx.fillStyle = `rgba(0, 207, 255, ${intensity})`;
      ctx.fillRect(0, 0, c.width, c.height);
    }

    // Fond grille
    ctx.strokeStyle = 'rgba(0,207,255,0.04)';
    for (let x = 0; x < c.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

    // Bactéries
    for (let b of this.bacteria) {
      if (!b.alive) continue;

      // Animation d'apparition
      if (b.alpha < 1) b.alpha = Math.min(1, b.alpha + 0.03);

      // Mouvement
      b.x += b.vx; b.y += b.vy;
      if (b.x < b.r || b.x > c.width - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > c.height - b.r) b.vy *= -1;

      // Mort progressive
      if (b.dying) {
        b.dyingTimer--;
        if (b.dyingTimer <= 0) {
          b.alive = false;
          // Particules de mort
          for (let i = 0; i < 6; i++) {
            const angle = (i/6)*Math.PI*2;
            this.particles.push({ x: b.x, y: b.y, vx: Math.cos(angle)*2, vy: Math.sin(angle)*2, life: 1, color: '#ff4d6d' });
          }
          continue;
        }
        b.alpha = b.dyingTimer / 80;
      }

      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.translate(b.x, b.y);

      const color = b.resistant ? '#ff4d6d' : '#00ff88';

      // Halo
      ctx.beginPath();
      ctx.arc(0, 0, b.r * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = color + '20';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = color + '99';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bouclier pour les résistantes
      if (b.resistant) {
        ctx.beginPath();
        ctx.arc(0, 0, b.r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,77,109,0.5)';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, b.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
      }

      ctx.restore();
    }

    // Particules
    this.particles = this.particles.filter(p => p.life > 0);
    for (let p of this.particles) {
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.04;
    }
    ctx.globalAlpha = 1;

    // Légende
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(10, c.height - 30, 12, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px Exo 2';
    ctx.textAlign = 'left';
    ctx.fillText('Sensible', 26, c.height - 20);

    ctx.fillStyle = '#ff4d6d';
    ctx.fillRect(100, c.height - 30, 12, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Résistante', 116, c.height - 20);

    if (this.antibioticActive) {
      ctx.fillStyle = '#00cfff';
      ctx.font = 'bold 12px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('💊 ANTIBIOTIQUE EN ACTION...', c.width/2, 20);
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================================
// NIVEAU 5 — Statistiques & Solutions (Accordéon)
// ============================================================
const Level5 = {
  revealed: 0,
  total: 6,

  init() {
    this.revealed = 0;
    Game.xpCurrent[5] = 0;
    Game.updateHUD(5);
    document.getElementById('btn-next5').disabled = true;
    document.getElementById('btn-next5').classList.remove('glow-pulse');
    // Remettre les valeurs cachées
    document.querySelectorAll('.stat-value').forEach(v => {
      v.classList.add('hidden-val');
    });
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('revealed'));
    document.querySelectorAll('.stat-hint').forEach(h => { h.style.display = ''; });
  },

  revealStat(card) {
    if (card.classList.contains('revealed')) return;
    card.classList.add('revealed');
    const val = card.querySelector('.stat-value');
    val.classList.remove('hidden-val');
    const hint = card.querySelector('.stat-hint');
    if (hint) hint.style.display = 'none';
    this.revealed++;
    Game.addScore(10);
    Game.addXP(5, 10);

    if (this.revealed >= this.total) {
      document.getElementById('btn-next5').disabled = false;
      document.getElementById('btn-next5').classList.add('glow-pulse');
    }
  }
};

// ============================================================
// QUIZ FINAL — Basé sur le PDF
// ============================================================
const Quiz = {
  questions: [
    {
      q: "En quelle année Alexander Fleming a-t-il découvert la pénicilline ?",
      answers: ["1905", "1928", "1945", "1963"],
      correct: 1,
      explanation: "Fleming observe en 1928 que la moisissure Penicillium notatum empêche la croissance de Staphylococcus aureus."
    },
    {
      q: "Quelle est la différence entre un antibiotique bactéricide et bactériostatique ?",
      answers: ["Le bactéricide est naturel, le bactériostatique est synthétique", "Le bactéricide tue la bactérie, le bactériostatique bloque sa reproduction", "Le bactéricide est plus cher", "Il n'y a pas de différence"],
      correct: 1,
      explanation: "Bactéricide = tue la bactérie. Bactériostatique = bloque sa reproduction. Les deux sont des modes d'action différents."
    },
    {
      q: "Combien de décès directs par an dans le monde sont liés aux infections résistantes (OMS, 2023) ?",
      answers: ["127 000", "500 000", "1,27 million", "10 millions"],
      correct: 2,
      explanation: "L'OMS estime 1,27 million de décès directs par an. Sans action, ce chiffre pourrait atteindre 10 millions d'ici 2050."
    },
    {
      q: "Qu'est-ce que le transfert horizontal de gènes ?",
      answers: ["Un échange d'ADN entre bactéries d'espèces différentes", "La mutation d'une bactérie sous l'effet d'un antibiotique", "La reproduction d'une bactérie par division", "Un mécanisme de défense immunitaire"],
      correct: 0,
      explanation: "Le transfert horizontal permet aux bactéries d'échanger des gènes de résistance via conjugaison, transformation ou transduction — même entre espèces différentes."
    },
    {
      q: "Qu'est-ce qu'une bactérie multirésistante (BMR) ?",
      answers: ["Une bactérie qui résiste à la chaleur", "Une bactérie résistant à plusieurs familles d'antibiotiques", "Une bactérie plus grande que les autres", "Une bactérie qui ne peut pas se reproduire"],
      correct: 1,
      explanation: "Une BMR résiste à plusieurs familles d'antibiotiques simultanément. Exemples : SARM, Pseudomonas aeruginosa multirésistant."
    },
    {
      q: "Quel est le SARM ?",
      answers: ["Un antibiotique de nouvelle génération", "Staphylococcus aureus Résistant à la Méticilline", "Un programme de surveillance des résistances", "Une technique de phagothérapie"],
      correct: 1,
      explanation: "Le SARM est Staphylococcus aureus Résistant à la Méticilline. Il est apparu dans les années 1960 et cause des infections graves en milieu hospitalier."
    },
    {
      q: "La phagothérapie consiste à utiliser :",
      answers: ["Des plantes médicinales contre les bactéries", "Des virus bactériophages pour éliminer les bactéries", "Des antibiotiques de synthèse renforcés", "Des nanoparticules contre les superbactéries"],
      correct: 1,
      explanation: "Inventée en 1917, la phagothérapie utilise des virus (bactériophages) pour détruire les bactéries. Elle est utilisée en dernier recours en Belgique et en France."
    },
    {
      q: "Selon l'approche 'One Health', la résistance aux antibiotiques nécessite une action sur :",
      answers: ["La santé humaine uniquement", "Les hôpitaux uniquement", "La santé humaine, animale ET environnementale", "La recherche pharmaceutique uniquement"],
      correct: 2,
      explanation: "Le concept 'One Health' relie santé humaine, animale et environnementale. En 2026, la Belgique a lancé un plan de 260 millions € basé sur cette approche."
    },
    {
      q: "Pourquoi les laboratoires pharmaceutiques investissent-ils peu dans les nouveaux antibiotiques ?",
      answers: ["Parce que c'est techniquement impossible", "Parce que les antibiotiques ont une faible rentabilité comparés à d'autres médicaments", "Parce que les gouvernements l'interdisent", "Parce que toutes les bactéries ont déjà des traitements"],
      correct: 1,
      explanation: "Les antibiotiques sont pris sur de courtes périodes et leur usage doit être limité. Leur rentabilité est faible comparée aux médicaments chroniques (cancer, diabète)."
    },
    {
      q: "Quelle découverte liée à l'IA a eu lieu en 2025 pour lutter contre les superbactéries ?",
      answers: ["La création d'un vaccin universel", "La lariocidine, un nouvel antibiotique contre des superbactéries quasi intraitables", "Un robot médical pour détecter les résistances", "Un test ADN instantané"],
      correct: 1,
      explanation: "En 2025, la lariocidine a été découverte grâce à l'IA. Elle permet de tuer certaines superbactéries qui étaient jusque-là quasi intraitables."
    }
  ],
  current: 0,
  score: 0,
  answered: false,

  start() {
    this.current = 0;
    this.score = 0;
    this.answered = false;
    this.showQuestion();
  },

  showQuestion() {
    const q = this.questions[this.current];
    this.answered = false;

    document.getElementById('question-area').textContent = q.q;
    document.getElementById('feedback-area').textContent = '';
    document.getElementById('quiz-progress-text').textContent = `Question ${this.current + 1} / ${this.questions.length}`;
    document.getElementById('quiz-progress-bar').style.width = ((this.current / this.questions.length) * 100) + '%';

    const aa = document.getElementById('answer-area');
    aa.innerHTML = '';
    q.answers.forEach((ans, i) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = ans;
      btn.onclick = () => this.answer(i);
      aa.appendChild(btn);
    });
  },

  answer(idx) {
    if (this.answered) return;
    this.answered = true;
    const q = this.questions[this.current];
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(b => b.disabled = true);

    if (idx === q.correct) {
      btns[idx].classList.add('correct');
      this.score++;
      Game.addScore(20);
      document.getElementById('feedback-area').innerHTML = `✅ <strong>Correct !</strong> ${q.explanation}`;
    } else {
      btns[idx].classList.add('wrong');
      btns[q.correct].classList.add('correct');
      document.getElementById('feedback-area').innerHTML = `❌ <strong>Incorrect.</strong> ${q.explanation}`;
    }

    setTimeout(() => {
      this.current++;
      if (this.current < this.questions.length) {
        this.showQuestion();
      } else {
        document.getElementById('quiz-progress-bar').style.width = '100%';
        setTimeout(() => Game.showEnd(this.score, this.questions.length), 500);
      }
    }, 2500);
  }
};

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // L'écran d'accueil est affiché par défaut grâce à la classe .active dans le HTML
  console.log('🦠 BactéroQuest chargé !');
});
