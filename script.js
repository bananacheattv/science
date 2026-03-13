/* ============================================================
   BACTÉROQUEST v3 — script.js
   Touch + responsive canvas · Antibiogramme non-bloquant
   TERMS modifiables via admin.html (localStorage)
   ============================================================ */

// ══════════════════════════════════════════════════════════════
// CANVAS UTILS — touch + mouse coords
// ══════════════════════════════════════════════════════════════
function canvasPos(canvas, e) {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width, sy = canvas.height / r.height;
  let cx, cy;
  if (e.touches?.length) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
  else if (e.changedTouches?.length) { cx = e.changedTouches[0].clientX; cy = e.changedTouches[0].clientY; }
  else { cx = e.clientX; cy = e.clientY; }
  return { x: (cx - r.left) * sx, y: (cy - r.top) * sy };
}
function onCanvasClick(canvas, fn) {
  canvas.addEventListener('click', e => { e.preventDefault(); fn(canvasPos(canvas, e)); });
  canvas.addEventListener('touchend', e => { e.preventDefault(); fn(canvasPos(canvas, e)); }, { passive: false });
}

// ══════════════════════════════════════════════════════════════
// TERMS — base de connaissances (overridable via admin)
// ══════════════════════════════════════════════════════════════
const TERMS_DEFAULT = {
  unicellulaire: {
    title: '🦠 Organisme Unicellulaire',
    content: `<p>Un organisme unicellulaire est composé d'<strong>une seule cellule</strong> qui remplit toutes les fonctions vitales : se nourrir, se reproduire, réagir à l'environnement.</p>
    <p>Les humains ont ~37 000 milliards de cellules spécialisées. Une bactérie est <em>tout en une</em>.</p>
    <div class="schema-box"><pre>
  Humain                 Bactérie
  37 000 Mrd cellules    1 cellule = 1 être vivant
  spécialisées           autonome et complet
    </pre></div>`
  },
  paroi: {
    title: '🏰 La Paroi Bactérienne',
    content: `<p>La paroi bactérienne est une structure rigide en <strong>peptidoglycane</strong>, un polymère unique aux bactéries. Elle maintient la forme et résiste à la pression osmotique.</p>
    <p><strong>C'est la cible des β-lactamines</strong> : elles bloquent la synthèse du peptidoglycane → la paroi se fragilise → la bactérie éclate.</p>
    <div class="schema-box"><pre>
  ┌─────────────────────────────┐
  │   PAROI (peptidoglycane)    │ ← cible β-lactamines
  │  ┌───────────────────────┐  │
  │  │  Membrane cellulaire  │  │
  │  │  ┌─────────────────┐  │  │
  │  │  │  Cytoplasme+ADN │  │  │
  │  │  └─────────────────┘  │  │
  │  └───────────────────────┘  │
  └─────────────────────────────┘
    </pre></div>`
  },
  coques: {
    title: '⚪ Les Coques',
    content: `<p>Les <strong>coques</strong> sont des bactéries de forme sphérique. Elles se regroupent en différentes configurations :</p>
    <div class="schema-box"><pre>
  ● = Monocoque (seule)
  ●● = Diplocoque (paires)  ex: Pneumocoque
  ●●● = Streptocoque (chaîne) ex: Streptococcus
  ❋❋  = Staphylocoque (grappe) ex: Staphylococcus aureus
    </pre></div>`
  },
  bacilles: {
    title: '🔴 Les Bacilles',
    content: `<p>Les <strong>bacilles</strong> sont des bactéries en forme de bâtonnet. Exemples :</p>
    <div class="schema-box"><pre>
  [====]  E. coli — bacille intestinal
  [====]  Salmonella — bâtonnet alimentaire
  [====]  Mycobacterium tuberculosis (bacille de Koch)
    </pre></div>
    <p>Certains bacilles ont des <em>flagelles</em> pour se déplacer, d'autres forment des <em>spores</em> résistantes.</p>`
  },
  scissiparite: {
    title: '✂️ Scissiparité',
    content: `<p>La <strong>scissiparité</strong> (ou fission binaire) est le mode de reproduction des bactéries. Une bactérie duplique son ADN, puis se divise en deux cellules filles identiques.</p>
    <div class="schema-box"><pre>
  1 bactérie  →  [======]
  Élongation  →  [==========]
  Division    →  [=====][=====]
  Résultat    →  2 bactéries filles
  
  Temps : 20 min → 1 milliard en 10h !
    </pre></div>`
  },
  exponentielle: {
    title: '📈 Croissance Exponentielle',
    content: `<p>La croissance bactérienne suit une courbe exponentielle : chaque division double la population.</p>
    <div class="schema-box"><pre>
  Temps   Divisions  Population
  0 min   0          1
  20 min  1          2
  40 min  2          4
  1h      3          8
  3h      9          512
  10h     30         1 000 000 000 !
    </pre></div>`
  },
  mutation: {
    title: '🧬 Mutation Génétique',
    content: `<p>Une <strong>mutation</strong> est une erreur dans la copie de l'ADN lors de la division. La plupart sont neutres, quelques-unes sont fatales, et certaines — rarement — confèrent un <strong>avantage</strong> comme la résistance à un antibiotique.</p>
    <div class="schema-box"><pre>
  ADN original  : ATGCTTGAC...
  Après copie   : ATGCTTCAC...  ← 1 base changée
                              = mutation ponctuelle
    </pre></div>
    <p>Sur 10 milliards de bactéries, même 1 mutation sur 10<sup>9</sup> donne des centaines de mutants !</p>`
  },
  penicilline: {
    title: '💊 La Pénicilline',
    content: `<p>Découverte par <strong>Alexander Fleming</strong> en 1928, la pénicilline est produite par la moisissure <em>Penicillium notatum</em>. Elle bloque la synthèse de la paroi bactérienne.</p>
    <p>C'est le premier antibiotique moderne. Son usage massif pendant et après la 2ème guerre mondiale a sauvé des millions de vies… et accéléré l'apparition des résistances.</p>`
  },
  bacteriostatique: {
    title: '🛡 Antibiotique Bactériostatique',
    content: `<p>Un antibiotique <strong>bactériostatique</strong> <em>bloque la multiplication</em> des bactéries sans les tuer directement. Il laisse le système immunitaire éliminer les bactéries immobilisées.</p>
    <div class="schema-box"><pre>
  Sans AB : ●→●● → ●●●● → ●●●●●●●●
  Avec AB  : ● → (bloqué) → ● ← système immun le détruit
    </pre></div>
    <p>Exemples : tétracyclines, macrolides, chloramphénicol.</p>`
  },
  bactericide: {
    title: '⚔️ Antibiotique Bactéricide',
    content: `<p>Un antibiotique <strong>bactéricide</strong> <em>tue directement</em> les bactéries. Il agit sur la paroi, la membrane ou la réplication de l'ADN.</p>
    <div class="schema-box"><pre>
  Sans AB : ●→●● → ●●●● → ...
  Avec AB  : ● → 💥 → ✗  (bactérie détruite)
    </pre></div>
    <p>Exemples : β-lactamines, fluoroquinolones, aminosides.</p>`
  },
  betalactamines: {
    title: '🔬 β-Lactamines',
    content: `<p>Les <strong>β-lactamines</strong> sont la famille d'antibiotiques la plus utilisée au monde. Elles comprennent les pénicillines, céphalosporines et carbapénèmes.</p>
    <p>Mécanisme : elles se lient aux <em>protéines de liaison à la pénicilline (PLP)</em>, bloquant la construction de la paroi bactérienne → la bactérie éclate.</p>
    <p>Principal mécanisme de résistance : les bactéries produisent des <span class="ct" onclick="openTerm('betalactamase')">β-lactamases</span>, des enzymes qui détruisent le noyau β-lactame.</p>`
  },
  antibiogramme: {
    title: '🧫 L\'Antibiogramme',
    content: `<p>L'antibiogramme est un test de laboratoire qui mesure la <strong>sensibilité d'une bactérie</strong> à différents antibiotiques.</p>
    <p>On place des disques imprégnés d'antibiotiques sur une boîte de Petri ensemencée avec la bactérie. Après 24h, on mesure le diamètre de la <span class="ct" onclick="openTerm('zoneInhibition')">zone d'inhibition</span> autour de chaque disque.</p>`
  },
  zoneInhibition: {
    title: '⭕ Zone d\'Inhibition',
    content: `<p>La <strong>zone d'inhibition</strong> est le cercle clair autour d'un disque antibiotique sur la boîte de Petri — là où les bactéries n'ont pas poussé.</p>
    <div class="schema-box"><pre>
  Grand cercle (> 20mm) → Bactérie SENSIBLE (S)
  Cercle moyen (15-20mm)→ INTERMÉDIAIRE (I)
  Petit cercle (< 15mm) → Bactérie RÉSISTANTE (R)
  Aucun cercle          → Résistance totale (R)
    </pre></div>`
  },
  resistant: {
    title: '🔴 Résistance Bactérienne',
    content: `<p>Une bactérie est dite <strong>résistante</strong> (R) à un antibiotique quand celui-ci ne peut plus l'éliminer aux concentrations thérapeutiques normales.</p>
    <p>Mécanismes : production de β-lactamases, modification de la cible, efflux actif (pompe qui expulse l'antibiotique), réduction de la perméabilité de la paroi.</p>`
  },
  pressionSelection: {
    title: '🎯 Pression de Sélection',
    content: `<p>La <strong>pression de sélection</strong> est la force environnementale (ici, un antibiotique) qui favorise la survie des individus possédant un avantage adaptatif.</p>
    <div class="schema-box"><pre>
  Population initiale :  ●●●●●🔴●●●●
  Antibiotique →         ✗✗✗✗✗ 🔴 ✗✗✗✗
  Après traitement :               🔴🔴🔴🔴🔴
  
  🔴 = bactérie résistante qui prolifère
    </pre></div>`
  },
  cibleAb: {
    title: '🎯 Cibles des Antibiotiques',
    content: `<p>Chaque antibiotique cible une structure <strong>spécifique à la bactérie</strong> (absent des cellules humaines) :</p>
    <div class="schema-box"><pre>
  CIBLE               ANTIBIOTIQUES
  ────────────────────────────────────
  Paroi (peptidogl.)  β-lactamines, vancomycine
  Membrane            Polymyxines
  Ribosomes (30S)     Aminosides, tétracyclines
  Ribosomes (50S)     Macrolides, chloramphénicol
  ADN gyrase          Fluoroquinolones
  ARN polymérase      Rifampicine
    </pre></div>`
  },
  betalactamase: {
    title: '🧪 β-Lactamases',
    content: `<p>Les <strong>β-lactamases</strong> sont des enzymes produites par certaines bactéries résistantes. Elles coupent le noyau β-lactame de l'antibiotique, le rendant inactif avant qu'il n'atteigne sa cible.</p>
    <div class="schema-box"><pre>
  Pénicilline → [β-lactame intact] → cible bactérie
  
  Résistance : β-lactamase + pénicilline → [β-lactame cassé] → inactif
    </pre></div>
    <p>Solution : associer une β-lactamine avec un <em>inhibiteur de β-lactamase</em> (ex: amoxicilline + acide clavulanique = Augmentin®).</p>`
  },
  transfertH: {
    title: '🔄 Transfert Horizontal de Gènes',
    content: `<p>Les bactéries peuvent s'échanger des gènes — y compris des gènes de résistance — sans reproduction sexuée. C'est le <strong>transfert horizontal de gènes</strong> (THG).</p>
    <div class="schema-box"><pre>
  3 mécanismes :
  
  Conjugaison  : 🦠—pilum—🦠  (contact direct, plasmide)
  Transformation: 🦠 absorbe ADN libre dans l'env.
  Transduction : 🦠 ← 🦠 via virus bactériophage
    </pre></div>
    <p>Cela explique pourquoi des résistances peuvent se propager très rapidement, même entre espèces différentes !</p>`
  },
  sarm: {
    title: '⚠️ Le SARM',
    content: `<p>Le <strong>SARM</strong> (Staphylococcus aureus Résistant à la Méticilline) est une bactérie hospitalière redoutée. Apparu dès 1961, il résiste à toutes les pénicillines classiques.</p>
    <p>Traitement de dernier recours : la <em>vancomycine</em>. Mais des SARM partiellement résistants à la vancomycine (VISA) ont déjà été identifiés...</p>
    <div class="schema-box"><pre>
  1943 : pénicilline découverte
  1947 : 1ères souches résistantes à la pénicilline
  1961 : méticilline introduite
  1961 : SARM détecté (même année !)
  Aujourd'hui : SARM = 20-30% des S. aureus hospit.
    </pre></div>`
  }
};

// Fusionner avec les overrides admin (localStorage)
function getTerms() {
  try {
    const overrides = JSON.parse(localStorage.getItem('bq_terms_override') || '{}');
    const merged = {};
    for (const k in TERMS_DEFAULT) {
      merged[k] = { ...TERMS_DEFAULT[k], ...overrides[k] };
    }
    // Ajouter les nouveaux termes créés dans l'admin
    for (const k in overrides) {
      if (!merged[k]) merged[k] = overrides[k];
    }
    return merged;
  } catch(e) { return TERMS_DEFAULT; }
}

function openTerm(key) {
  const terms = getTerms();
  const term = terms[key];
  if (!term) return;
  document.getElementById('term-modal-content').innerHTML = `<h3>${term.title}</h3>${term.content}`;
  document.getElementById('term-modal').classList.remove('hidden');
}
function closeTerm() { document.getElementById('term-modal').classList.add('hidden'); }
// Close on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('term-modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeTerm();
  });
});

// ══════════════════════════════════════════════════════════════
// GAME MANAGER
// ══════════════════════════════════════════════════════════════
const Game = {
  score: 0,
  currentLevel: 0,
  unlockedLevels: [1],
  xpGoals: { 1:50, 2:40, 3:50, 4:60, 5:60, 6:60 },
  xpCurrent: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 },

  startGame() {
    this.showScreen('screen-level1');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('level-nav').classList.remove('hidden');
    this.updateHUD(1); this.unlockNav(1);
    Level1.init();
  },
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
  },
  goToLevel(n) {
    if (!this.unlockedLevels.includes(n)) return;
    this.currentLevel = n;
    this.showScreen('screen-level' + n);
    this.updateHUD(n); this.updateNavActive(n);
    [null, Level1, Level2, Level3, Level4, Level5, Level6][n]?.init();
  },
  nextLevel() {
    const next = this.currentLevel + 1;
    if (next <= 6) {
      if (!this.unlockedLevels.includes(next)) this.unlockedLevels.push(next);
      this.unlockNav(next); this.goToLevel(next);
    }
  },
  goQuiz() {
    this.showScreen('screen-quiz');
    document.getElementById('hud-level').textContent = 'Q';
    this.updateNavActive('Q'); this.unlockNav('Q');
    Quiz.start();
  },
  addScore(pts) {
    this.score += pts;
    document.getElementById('hud-score').textContent = this.score;
  },
  addXP(lv, pts) {
    this.xpCurrent[lv] = Math.min(this.xpGoals[lv], (this.xpCurrent[lv]||0) + pts);
    this.updateHUD(lv);
    if (this.xpCurrent[lv] >= this.xpGoals[lv]) {
      const btn = document.getElementById('btn-next' + lv);
      if (btn) { btn.disabled = false; btn.classList.add('glow-pulse'); }
    }
  },
  updateHUD(lv) {
    this.currentLevel = lv;
    document.getElementById('hud-level').textContent = lv;
    const xp = this.xpCurrent[lv]||0, goal = this.xpGoals[lv]||100;
    document.getElementById('progress-bar').style.width = ((xp/goal)*100)+'%';
    document.getElementById('progress-text').textContent = xp+' / '+goal+' XP';
  },
  unlockNav(id) { document.getElementById('nav'+id)?.classList.add('unlocked'); },
  updateNavActive(id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('nav'+id)?.classList.add('active');
  },
  showEnd(qs, total) {
    this.showScreen('screen-end');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('end-score').textContent = this.score;
    const rank = qs>=8 ? '🌟 Expert en Microbiologie' : qs>=5 ? '🔬 Scientifique Confirmé' : '🧫 Apprenti Biologiste';
    const msg  = qs>=8 ? 'Impressionnant ! Tu maîtrises parfaitement les mécanismes de résistance bactérienne.'
                : qs>=5 ? 'Très bien ! Tu comprends les grandes lignes. Continue à approfondir !'
                : 'Bon début ! Relis les niveaux pour mieux comprendre les mécanismes.';
    document.getElementById('end-rank').textContent = rank;
    document.getElementById('end-message').textContent = msg + '\n\nQuiz : '+qs+'/'+total+' bonnes réponses.';
  },
  restart() {
    this.score = 0; this.currentLevel = 0; this.unlockedLevels = [1];
    this.xpCurrent = {1:0,2:0,3:0,4:0,5:0,6:0};
    document.getElementById('hud-score').textContent = '0';
    document.querySelectorAll('.btn-next').forEach(b => { b.disabled=true; b.classList.remove('glow-pulse'); });
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('unlocked','active'));
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('level-nav').classList.add('hidden');
    this.showScreen('screen-home');
  }
};

// ══════════════════════════════════════════════════════════════
// SHARED CANVAS DRAW UTILS
// ══════════════════════════════════════════════════════════════
function drawGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(0,207,255,0.045)';
  ctx.lineWidth = 1;
  for (let x=0; x<w; x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for (let y=0; y<h; y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
}

// ══════════════════════════════════════════════════════════════
// NIVEAU 1 — Découverte des Bactéries
// ══════════════════════════════════════════════════════════════
const Level1 = {
  canvas:null, ctx:null, bacteria:[], clicked:new Set(), animId:null,
  infos:[
    { name:'Staphylococcus aureus', color:'#ffd60a', shape:'round', info:'<h4>🦠 Staphylococcus aureus</h4><p>Coque dorée. Cause infections cutanées, pulmonaires, sanguines. Le SARM en est la souche résistante la plus redoutée en milieu hospitalier.</p>' },
    { name:'E. coli',               color:'#00ff88', shape:'rod',   info:'<h4>🦠 Escherichia coli</h4><p>Bacille intestinal. Certaines souches résistantes dans >50% des cas dans certains pays. Vecteur fréquent de gènes de résistance.</p>' },
    { name:'Pseudomonas',            color:'#00cfff', shape:'rod',   info:'<h4>🦠 Pseudomonas aeruginosa</h4><p>Bacille multirésistant. Infections graves chez les immunodéprimés. Résiste simultanément à plusieurs familles d\'antibiotiques.</p>' },
    { name:'Bactérie mutante',       color:'#ff4d6d', shape:'round', info:'<h4>⚠️ Bactérie avec Mutation</h4><p>Mutation spontanée lors de la réplication. Cette bactérie produit une β-lactamase — une enzyme qui détruit la pénicilline. C\'est le début de la résistance !</p>' },
    { name:'Salmonella',             color:'#9b5de5', shape:'rod',   info:'<h4>🦠 Salmonella</h4><p>Transmise par les aliments. Des souches résistantes ont été retrouvées dans la chaîne alimentaire, liées à l\'usage d\'antibiotiques dans les élevages.</p>' },
  ],
  init() {
    this.canvas = document.getElementById('canvas1');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bacteria = []; this.clicked.clear();
    if (this.animId) cancelAnimationFrame(this.animId);
    for (let i=0; i<5; i++) {
      const info = this.infos[i];
      this.bacteria.push({ x:80+Math.random()*540, y:50+Math.random()*320, vx:(Math.random()-.5)*1.3, vy:(Math.random()-.5)*1.3, r:22+Math.random()*10, angle:Math.random()*Math.PI*2, aSpeed:(Math.random()-.5)*.025, pulse:0, pulsing:false, ...info });
    }
    onCanvasClick(this.canvas, pos => this.onClick(pos));
    this.loop();
  },
  onClick({x,y}) {
    for (let b of this.bacteria) {
      if (Math.hypot(x-b.x, y-b.y) < b.r+12) {
        b.pulsing=true; b.pulse=1;
        if (!this.clicked.has(b.name)) {
          this.clicked.add(b.name);
          Game.addScore(10); Game.addXP(1, 10);
          document.getElementById('popup-content').innerHTML = b.info;
          document.getElementById('info-popup').classList.remove('hidden');
        }
        break;
      }
    }
  },
  loop() {
    const c=this.canvas, ctx=this.ctx;
    ctx.clearRect(0,0,c.width,c.height); drawGrid(ctx,c.width,c.height);
    for (let b of this.bacteria) {
      b.x+=b.vx; b.y+=b.vy; b.angle+=b.aSpeed;
      if(b.x<b.r||b.x>c.width-b.r) b.vx*=-1;
      if(b.y<b.r||b.y>c.height-b.r) b.vy*=-1;
      if(b.pulsing){b.pulse-=.05; if(b.pulse<=0)b.pulsing=false;}
      const ic=this.clicked.has(b.name), sc=1+(b.pulsing?b.pulse*.3:0);
      ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.angle); ctx.scale(sc,sc);
      // halo
      const g=ctx.createRadialGradient(0,0,b.r*.4,0,0,b.r*2);
      g.addColorStop(0, b.color+'50'); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,b.r*2,0,Math.PI*2); ctx.fill();
      // corps
      if(b.shape==='round') {
        ctx.beginPath(); ctx.arc(0,0,b.r,0,Math.PI*2);
        ctx.fillStyle=b.color+(ic?'cc':'88'); ctx.fill();
        ctx.strokeStyle=b.color; ctx.lineWidth=ic?3:1.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(b.r,0); ctx.bezierCurveTo(b.r+18,-12,b.r+28,12,b.r+40,0);
        ctx.strokeStyle=b.color+'70'; ctx.lineWidth=1.5; ctx.stroke();
      } else {
        const w=b.r*.6,h=b.r*1.6;
        ctx.beginPath(); ctx.roundRect(-w,-h,w*2,h*2,w);
        ctx.fillStyle=b.color+(ic?'cc':'88'); ctx.fill();
        ctx.strokeStyle=b.color; ctx.lineWidth=ic?3:1.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,h); ctx.bezierCurveTo(14,h+14,-14,h+28,0,h+42);
        ctx.strokeStyle=b.color+'70'; ctx.lineWidth=1.5; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0,0,b.r*.25,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fill();
      ctx.restore();
      ctx.fillStyle = ic ? b.color : 'rgba(255,255,255,.35)';
      ctx.font = ic ? 'bold 10px Exo 2' : '9px Exo 2';
      ctx.textAlign='center'; ctx.fillText(b.name, b.x, b.y+b.r+16);
    }
    this.animId = requestAnimationFrame(()=>this.loop());
  }
};
function closePopup() { document.getElementById('info-popup').classList.add('hidden'); }

// ══════════════════════════════════════════════════════════════
// NIVEAU 2 — Multiplication
// ══════════════════════════════════════════════════════════════
const Level2 = {
  canvas:null, ctx:null, bacteria:[], divisions:0, animId:null,
  init() {
    this.canvas=document.getElementById('canvas2'); if(!this.canvas)return;
    this.ctx=this.canvas.getContext('2d');
    this.bacteria=[]; this.divisions=0;
    if(this.animId)cancelAnimationFrame(this.animId);
    document.getElementById('division-count').textContent='Divisions : 0';
    this.bacteria.push(this.newB(350,210,'#00ff88'));
    this.loop();
  },
  newB(x,y,color) {
    return { x,y, vx:(Math.random()-.5)*1.5, vy:(Math.random()-.5)*1.5, r:16, color, dividing:false, divProg:0, mutation:Math.random()<.15 };
  },
  divideBacteria() {
    if(this.bacteria.length>=32){ document.getElementById('division-count').textContent='Population max (32) !'; return; }
    const p=this.bacteria[Math.floor(Math.random()*this.bacteria.length)];
    p.dividing=true; p.divProg=0;
    setTimeout(()=>{
      const mc=p.mutation?'#ff4d6d':p.color;
      this.bacteria.push(this.newB(p.x+22,p.y+(Math.random()-.5)*22,mc));
      p.dividing=false; this.divisions++;
      document.getElementById('division-count').textContent=`Divisions : ${this.divisions} | Pop : ${this.bacteria.length}`;
      Game.addScore(5); Game.addXP(2,10);
      if(this.divisions>=4){ document.getElementById('btn-next2').disabled=false; document.getElementById('btn-next2').classList.add('glow-pulse'); }
    },600);
  },
  reset() {
    this.bacteria=[]; this.divisions=0;
    document.getElementById('division-count').textContent='Divisions : 0';
    document.getElementById('btn-next2').disabled=true; document.getElementById('btn-next2').classList.remove('glow-pulse');
    Game.xpCurrent[2]=0; Game.updateHUD(2);
    this.bacteria.push(this.newB(350,210,'#00ff88'));
  },
  loop() {
    const c=this.canvas,ctx=this.ctx;
    ctx.clearRect(0,0,c.width,c.height); drawGrid(ctx,c.width,c.height);
    for(let b of this.bacteria){
      b.x+=b.vx; b.y+=b.vy;
      if(b.x<b.r||b.x>c.width-b.r)b.vx*=-1;
      if(b.y<b.r||b.y>c.height-b.r)b.vy*=-1;
      if(b.dividing)b.divProg=Math.min(1,b.divProg+.05);
      ctx.save(); ctx.translate(b.x,b.y);
      if(b.mutation){ ctx.beginPath(); ctx.arc(0,0,b.r*2.2,0,Math.PI*2); ctx.fillStyle='rgba(255,77,109,.1)'; ctx.fill(); }
      ctx.scale(b.dividing?1+b.divProg*.5:1, b.dividing?1-b.divProg*.3:1);
      ctx.beginPath(); ctx.arc(0,0,b.r,0,Math.PI*2);
      ctx.fillStyle=b.color+'bb'; ctx.fill();
      ctx.strokeStyle=b.color; ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,b.r*.3,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fill();
      ctx.restore();
      if(b.mutation){ ctx.fillStyle='#ff4d6d'; ctx.font='bold 9px Exo 2'; ctx.textAlign='center'; ctx.fillText('MUTATION',b.x,b.y-b.r-5); }
    }
    ctx.fillStyle='rgba(0,207,255,.55)'; ctx.font='bold 13px Orbitron'; ctx.textAlign='left';
    ctx.fillText('Population : '+this.bacteria.length, 12, 22);
    this.animId=requestAnimationFrame(()=>this.loop());
  }
};

// ══════════════════════════════════════════════════════════════
// NIVEAU 3 — Antibiotiques
// ══════════════════════════════════════════════════════════════
const Level3 = {
  canvas:null, ctx:null, bacteria:[], weapon:null, treated:0, animId:null,
  init() {
    this.canvas=document.getElementById('canvas3'); if(!this.canvas)return;
    this.ctx=this.canvas.getContext('2d'); this.bacteria=[]; this.weapon=null; this.treated=0;
    if(this.animId)cancelAnimationFrame(this.animId);
    document.getElementById('weapon-selected').textContent='Aucun sélectionné';
    ['btn-bstat','btn-bkill'].forEach(id=>document.getElementById(id)?.classList.remove('selected'));
    for(let i=0;i<8;i++) this.bacteria.push({ x:60+Math.random()*580, y:40+Math.random()*340, vx:(Math.random()-.5)*1.4, vy:(Math.random()-.5)*1.4, r:18, alive:true, stunned:false, dying:false, dyingT:0 });
    onCanvasClick(this.canvas, pos=>this.onClick(pos));
    this.loop();
  },
  selectWeapon(w) {
    this.weapon=w;
    document.getElementById('weapon-selected').textContent = w==='static'?'🛡 Bactériostatique sélectionné':'⚔️ Bactéricide sélectionné';
    document.getElementById('btn-bstat').classList.toggle('selected',w==='static');
    document.getElementById('btn-bkill').classList.toggle('selected',w==='kill');
  },
  onClick({x,y}) {
    if(!this.weapon)return;
    for(let b of this.bacteria){
      if(!b.alive||b.stunned||b.dying)continue;
      if(Math.hypot(x-b.x,y-b.y)<b.r+8){
        if(this.weapon==='kill'){ b.dying=true; b.dyingT=40; }
        else { b.stunned=true; }
        this.treated++; Game.addScore(10); Game.addXP(3,10);
        if(this.treated>=5){ document.getElementById('btn-next3').disabled=false; document.getElementById('btn-next3').classList.add('glow-pulse'); }
        break;
      }
    }
  },
  loop() {
    const c=this.canvas,ctx=this.ctx;
    ctx.clearRect(0,0,c.width,c.height); drawGrid(ctx,c.width,c.height);
    for(let b of this.bacteria){
      if(!b.alive)continue;
      if(b.dying){ b.dyingT--; if(b.dyingT<=0){b.alive=false;continue;} }
      if(!b.stunned){ b.x+=b.vx; b.y+=b.vy; if(b.x<b.r||b.x>c.width-b.r)b.vx*=-1; if(b.y<b.r||b.y>c.height-b.r)b.vy*=-1; }
      ctx.save(); ctx.globalAlpha=b.dying?b.dyingT/40:1; ctx.translate(b.x,b.y);
      if(b.stunned){ ctx.beginPath(); ctx.arc(0,0,b.r*2.2,0,Math.PI*2); ctx.fillStyle='rgba(0,207,255,.15)'; ctx.fill(); }
      ctx.beginPath(); ctx.arc(0,0,b.r,0,Math.PI*2);
      ctx.fillStyle=b.stunned?'#00cfff99':b.dying?'#ff4d6d66':'#ffd60a99'; ctx.fill();
      ctx.strokeStyle=b.stunned?'#00cfff':b.dying?'#ff4d6d':'#ffd60a'; ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,b.r*.3,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fill();
      if(b.stunned){ ctx.fillStyle='#00cfff'; ctx.font='bold 9px Exo 2'; ctx.textAlign='center'; ctx.fillText('BLOQUÉE',0,-b.r-6); }
      ctx.restore();
    }
    if(!this.weapon){ ctx.fillStyle='rgba(255,214,10,.7)'; ctx.font='13px Exo 2'; ctx.textAlign='center'; ctx.fillText('← Sélectionne un antibiotique d\'abord !',c.width/2,c.height-14); }
    this.animId=requestAnimationFrame(()=>this.loop());
  }
};

// ══════════════════════════════════════════════════════════════
// NIVEAU 4 — Antibiogramme (non bloquant — info dans sidebar)
// ══════════════════════════════════════════════════════════════
const Level4 = {
  canvas:null, ctx:null, animId:null, hovered:-1, revealed:new Set(),
  discs:[
    { name:'AMX', full:'Amoxicilline',   color:'#00ff88', angle:0,     zone:8,  result:'R', interp:'Résistant — β-lactamase produite' },
    { name:'CIP', full:'Ciprofloxacine', color:'#00cfff', angle:60,    zone:24, result:'S', interp:'Sensible — traitement efficace' },
    { name:'MET', full:'Méticilline',    color:'#ffd60a', angle:120,   zone:6,  result:'R', interp:'Résistant — SARM confirmé' },
    { name:'TET', full:'Tétracycline',   color:'#9b5de5', angle:180,   zone:18, result:'I', interp:'Intermédiaire — dose élevée nécessaire' },
    { name:'VAN', full:'Vancomycine',    color:'#ff6b6b', angle:240,   zone:22, result:'S', interp:'Sensible — traitement de dernier recours' },
    { name:'ERY', full:'Érythromycine',  color:'#ffa500', angle:300,   zone:5,  result:'R', interp:'Résistant — modification ribosome' },
  ],
  CX:350, CY:210, PLATE_R:170, DISC_R:14,

  init() {
    this.canvas=document.getElementById('canvas4'); if(!this.canvas)return;
    this.ctx=this.canvas.getContext('2d'); this.hovered=-1; this.revealed=new Set();
    if(this.animId)cancelAnimationFrame(this.animId);
    document.getElementById('btn-next4').disabled=true;
    document.getElementById('bio-disc-details').innerHTML='<p style="color:var(--dim);font-style:italic;font-size:11px">Clique un disque pour l\'analyser →</p>';
    onCanvasClick(this.canvas, pos=>this.onClick(pos));
    this.canvas.addEventListener('mousemove', e=>{ const p=canvasPos(this.canvas,e); this.hovered=this.discAt(p.x,p.y); });
    this.canvas.addEventListener('mouseleave',()=>{ this.hovered=-1; });
    this.canvas.addEventListener('touchmove', e=>{ e.preventDefault(); const p=canvasPos(this.canvas,e); this.hovered=this.discAt(p.x,p.y); },{passive:false});
    this.loop();
  },

  discPos(d) {
    const a=d.angle*(Math.PI/180);
    return { x:this.CX+Math.cos(a)*this.PLATE_R*.62, y:this.CY+Math.sin(a)*this.PLATE_R*.58 };
  },
  discAt(x,y) {
    for(let i=0;i<this.discs.length;i++){
      const p=this.discPos(this.discs[i]);
      if(Math.hypot(x-p.x,y-p.y)<this.DISC_R+12) return i;
    }
    return -1;
  },
  onClick({x,y}) {
    const i=this.discAt(x,y);
    if(i<0) return;
    this.revealed.add(i);
    const d=this.discs[i];
    // Mettre à jour le panneau latéral (non bloquant !)
    const col = d.result==='S'?'var(--green)':d.result==='I'?'var(--yellow)':'var(--red)';
    const badge = `<span class="bio-result-badge ${d.result}">${d.result}</span>`;
    document.getElementById('bio-disc-details').innerHTML = `
      <div class="bio-disc-card active">
        <div class="bio-disc-name">${d.full} (${d.name})</div>
        <div class="bio-disc-zone">Zone d'inhibition : <strong style="color:${col}">${d.zone} mm</strong> ${badge}</div>
        <div class="bio-disc-zone" style="margin-top:4px;font-size:11px;color:var(--dim)">${d.interp}</div>
      </div>`;
    Game.addScore(10); Game.addXP(4,10);
    if(this.revealed.size>=this.discs.length){
      document.getElementById('btn-next4').disabled=false;
      document.getElementById('btn-next4').classList.add('glow-pulse');
    }
  },

  loop() {
    const c=this.canvas,ctx=this.ctx;
    ctx.clearRect(0,0,c.width,c.height);

    // Fond gélose
    const bg=ctx.createRadialGradient(this.CX,this.CY,10,this.CX,this.CY,this.PLATE_R);
    bg.addColorStop(0,'rgba(20,60,20,.8)'); bg.addColorStop(.7,'rgba(10,40,10,.6)'); bg.addColorStop(1,'rgba(0,15,5,.3)');
    ctx.beginPath(); ctx.arc(this.CX,this.CY,this.PLATE_R,0,Math.PI*2);
    ctx.fillStyle=bg; ctx.fill();
    ctx.strokeStyle='rgba(0,255,136,.3)'; ctx.lineWidth=2; ctx.stroke();

    // Label plaque
    ctx.fillStyle='rgba(0,255,136,.4)'; ctx.font='11px Orbitron'; ctx.textAlign='center';
    ctx.fillText('BOÎTE DE PÉTRI', this.CX, this.CY-this.PLATE_R+18);

    // Bactéries colonisant la boîte (fond)
    for(let i=0;i<60;i++){
      const a=i*(137.5*(Math.PI/180)), r=20+i*2.2;
      if(r>this.PLATE_R-12) continue;
      ctx.beginPath(); ctx.arc(this.CX+Math.cos(a)*r, this.CY+Math.sin(a)*r, 2, 0, Math.PI*2);
      ctx.fillStyle='rgba(0,255,100,.25)'; ctx.fill();
    }

    // Disques antibiotiques
    for(let i=0;i<this.discs.length;i++){
      const d=this.discs[i], pos=this.discPos(d);
      const isHov=(i===this.hovered), isRev=this.revealed.has(i);
      const resultCol = d.result==='S'?'#00ff88':d.result==='I'?'#ffd60a':'#ff4d6d';

      // Zone d'inhibition (cercle clair)
      if(isRev){
        const zoneR = d.zone * 1.8;
        const zg=ctx.createRadialGradient(pos.x,pos.y,this.DISC_R,pos.x,pos.y,zoneR);
        zg.addColorStop(0,'rgba(0,0,0,0)');
        zg.addColorStop(.4,resultCol+'08');
        zg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(pos.x,pos.y,zoneR,0,Math.PI*2);
        ctx.fillStyle=zg; ctx.fill();
        // Cercle de délimitation
        ctx.beginPath(); ctx.arc(pos.x,pos.y,zoneR,0,Math.PI*2);
        ctx.strokeStyle=resultCol+'55'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]); ctx.stroke();
        ctx.setLineDash([]);
        // Mesure mm
        ctx.fillStyle=resultCol+'cc'; ctx.font='bold 10px Orbitron'; ctx.textAlign='center';
        ctx.fillText(d.zone+'mm', pos.x, pos.y-zoneR-6);
      }

      // Disque (cercle blanc antibiotique)
      ctx.beginPath(); ctx.arc(pos.x,pos.y,this.DISC_R,0,Math.PI*2);
      ctx.fillStyle=isHov?'rgba(255,255,255,.9)':'rgba(240,240,240,.75)';
      ctx.fill();
      ctx.strokeStyle=isRev?resultCol:isHov?d.color:'rgba(200,200,200,.5)';
      ctx.lineWidth=isRev||isHov?2.5:1.5; ctx.stroke();

      // Nom antibiotique
      ctx.fillStyle=isRev?resultCol:'rgba(0,0,0,.75)';
      ctx.font='bold 8px Orbitron'; ctx.textAlign='center';
      ctx.fillText(d.name, pos.x, pos.y+3);

      // Badge résultat
      if(isRev){
        ctx.fillStyle=resultCol;
        ctx.font='bold 10px Orbitron'; ctx.fillText(d.result, pos.x, pos.y+this.DISC_R+14);
      }
      // Indication hover
      if(isHov&&!isRev){
        ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font='9px Exo 2'; ctx.fillText('tap',pos.x,pos.y+this.DISC_R+13);
      }
    }

    // Compteur
    ctx.fillStyle='rgba(0,255,136,.5)'; ctx.font='11px Orbitron'; ctx.textAlign='left';
    ctx.fillText(`Analysés : ${this.revealed.size}/${this.discs.length}`, 12, 22);

    this.animId=requestAnimationFrame(()=>this.loop());
  }
};

// ══════════════════════════════════════════════════════════════
// NIVEAU 5 — Résistance (sélection naturelle)
// ══════════════════════════════════════════════════════════════
const Level5 = {
  canvas:null,ctx:null,bacteria:[],particles:[],generations:0,abActive:false,abTimer:0,animId:null,
  init() {
    this.canvas=document.getElementById('canvas5'); if(!this.canvas)return;
    this.ctx=this.canvas.getContext('2d');
    if(this.animId)cancelAnimationFrame(this.animId);
    this.particles=[]; this.generations=0; this.abActive=false; this.abTimer=0;
    this.reset();
  },
  newB(x,y,resistant,alpha=1){
    return { x,y, vx:(Math.random()-.5)*1.3, vy:(Math.random()-.5)*1.3, r:14, resistant, alive:true, alpha, dying:false, dyingT:0 };
  },
  reset() {
    this.bacteria=[];
    for(let i=0;i<16;i++) this.bacteria.push(this.newB(40+Math.random()*620, 20+Math.random()*380, Math.random()<.2));
    document.getElementById('resistant-count').textContent='Résistantes : '+this.bacteria.filter(b=>b.resistant&&b.alive).length;
    document.getElementById('btn-next5').disabled=true; document.getElementById('btn-next5').classList.remove('glow-pulse');
    if(this.animId)cancelAnimationFrame(this.animId);
    this.loop();
  },
  addAntibiotic() {
    if(this.abActive)return;
    this.abActive=true; this.abTimer=220; this.generations++;
    for(let b of this.bacteria) if(b.alive&&!b.resistant){ b.dying=true; b.dyingT=30+Math.random()*80; }
    setTimeout(()=>{
      const surv=this.bacteria.filter(b=>b.alive&&b.resistant);
      for(let s of surv) if(this.bacteria.length<32) this.bacteria.push(this.newB(s.x+(Math.random()-.5)*35,s.y+(Math.random()-.5)*35,true,0));
      this.abActive=false;
      const rc=this.bacteria.filter(b=>b.resistant&&b.alive).length;
      document.getElementById('resistant-count').textContent=`Gén. ${this.generations} | Résistantes : ${rc}/${this.bacteria.filter(b=>b.alive).length}`;
      Game.addScore(15); Game.addXP(5,20);
      if(this.generations>=3||rc>5){ document.getElementById('btn-next5').disabled=false; document.getElementById('btn-next5').classList.add('glow-pulse'); }
    },2600);
  },
  loop() {
    const c=this.canvas,ctx=this.ctx;
    ctx.clearRect(0,0,c.width,c.height);
    if(this.abActive&&this.abTimer>0){ this.abTimer--; ctx.fillStyle=`rgba(0,207,255,${(this.abTimer/220)*.18})`; ctx.fillRect(0,0,c.width,c.height); }
    drawGrid(ctx,c.width,c.height);
    for(let b of this.bacteria){
      if(!b.alive)continue;
      if(b.alpha<1)b.alpha=Math.min(1,b.alpha+.03);
      if(!b.dying){b.x+=b.vx;b.y+=b.vy; if(b.x<b.r||b.x>c.width-b.r)b.vx*=-1; if(b.y<b.r||b.y>c.height-b.r)b.vy*=-1;}
      if(b.dying){b.dyingT--;if(b.dyingT<=0){b.alive=false;for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;this.particles.push({x:b.x,y:b.y,vx:Math.cos(a)*2.5,vy:Math.sin(a)*2.5,life:1});}continue;}b.alpha=b.dyingT/80;}
      const col=b.resistant?'#ff4d6d':'#00ff88';
      ctx.save(); ctx.globalAlpha=b.alpha; ctx.translate(b.x,b.y);
      ctx.beginPath(); ctx.arc(0,0,b.r*1.7,0,Math.PI*2); ctx.fillStyle=col+'18'; ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,b.r,0,Math.PI*2); ctx.fillStyle=col+'99'; ctx.fill();
      ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke();
      if(b.resistant){ctx.beginPath();ctx.arc(0,0,b.r*.45,0,Math.PI*2);ctx.fillStyle='rgba(255,77,109,.55)';ctx.fill();}
      else{ctx.beginPath();ctx.arc(0,0,b.r*.3,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fill();}
      ctx.restore();
    }
    this.particles=this.particles.filter(p=>p.life>0);
    for(let p of this.particles){ ctx.globalAlpha=p.life; ctx.beginPath(); ctx.arc(p.x,p.y,3*p.life,0,Math.PI*2); ctx.fillStyle='#ff4d6d'; ctx.fill(); p.x+=p.vx;p.y+=p.vy;p.life-=.04; }
    ctx.globalAlpha=1;
    // Légende
    ctx.fillStyle='#00ff88'; ctx.fillRect(12,c.height-34,13,13);
    ctx.fillStyle='rgba(255,255,255,.6)'; ctx.font='11px Exo 2'; ctx.textAlign='left'; ctx.fillText('Sensible',30,c.height-23);
    ctx.fillStyle='#ff4d6d'; ctx.fillRect(110,c.height-34,13,13);
    ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fillText('Résistante',128,c.height-23);
    if(this.abActive){ ctx.fillStyle='#00cfff'; ctx.font='bold 13px Orbitron'; ctx.textAlign='center'; ctx.fillText('💊 ANTIBIOTIQUE EN ACTION...',c.width/2,22); }
    this.animId=requestAnimationFrame(()=>this.loop());
  }
};

// ══════════════════════════════════════════════════════════════
// NIVEAU 6 — Impact mondial & Stats
// ══════════════════════════════════════════════════════════════
const Level6 = {
  revealed:0, total:6,
  init() {
    this.revealed=0; Game.xpCurrent[6]=0; Game.updateHUD(6);
    document.getElementById('btn-next6').disabled=true; document.getElementById('btn-next6').classList.remove('glow-pulse');
    document.querySelectorAll('.stat-value').forEach(v=>v.classList.add('hidden-val'));
    document.querySelectorAll('.stat-card').forEach(c=>c.classList.remove('revealed'));
    document.querySelectorAll('.stat-hint').forEach(h=>h.style.display='');
  },
  revealStat(card) {
    if(card.classList.contains('revealed'))return;
    card.classList.add('revealed');
    card.querySelector('.stat-value').classList.remove('hidden-val');
    const hint=card.querySelector('.stat-hint');
    if(hint)hint.style.display='none';
    this.revealed++; Game.addScore(10); Game.addXP(6,10);
    if(this.revealed>=this.total){ document.getElementById('btn-next6').disabled=false; document.getElementById('btn-next6').classList.add('glow-pulse'); }
  }
};

// ══════════════════════════════════════════════════════════════
// QUIZ FINAL
// ══════════════════════════════════════════════════════════════
const Quiz = {
  questions:[
    { q:"En quelle année Alexander Fleming a-t-il découvert la pénicilline ?", answers:["1905","1928","1945","1963"], correct:1, explanation:"Fleming observe en 1928 que Penicillium notatum empêche la croissance de Staphylococcus aureus." },
    { q:"Quelle est la différence entre bactéricide et bactériostatique ?", answers:["Naturel vs synthétique","Le bactéricide tue, le bactériostatique bloque la reproduction","Le bactéricide est plus cher","Il n'y a pas de différence"], correct:1, explanation:"Bactéricide = tue la bactérie. Bactériostatique = bloque sa reproduction. Deux modes d'action complémentaires." },
    { q:"Combien de décès directs/an dans le monde (OMS 2023) liés aux résistances ?", answers:["127 000","500 000","1,27 million","10 millions"], correct:2, explanation:"L'OMS estime 1,27 million de décès directs/an. Sans action, 10 millions d'ici 2050." },
    { q:"Qu'est-ce que le transfert horizontal de gènes ?", answers:["Échange d'ADN entre bactéries","Mutation sous effet d'antibiotique","Reproduction par division","Mécanisme immunitaire"], correct:0, explanation:"Le transfert horizontal permet aux bactéries d'échanger des gènes de résistance via conjugaison, transformation ou transduction." },
    { q:"Qu'est-ce qu'une bactérie multirésistante (BMR) ?", answers:["Résiste à la chaleur","Résiste à plusieurs familles d'antibiotiques","Plus grande que les autres","Ne peut pas se reproduire"], correct:1, explanation:"Une BMR résiste à plusieurs familles d'antibiotiques simultanément. Ex : SARM, Pseudomonas aeruginosa." },
    { q:"Que signifie SARM ?", answers:["Super Antibiotique Résistant Médicalement","Staphylococcus aureus Résistant à la Méticilline","Syndrome Aigu de Résistance Microbienne","Système Antibactérien Résistant Mutant"], correct:1, explanation:"Le SARM est apparu en 1961 et cause des infections graves en milieu hospitalier. Traitement : vancomycine." },
    { q:"La phagothérapie utilise :", answers:["Des plantes médicinales","Des virus bactériophages","Des antibiotiques renforcés","Des nanoparticules"], correct:1, explanation:"Inventée en 1917, la phagothérapie utilise des virus (bactériophages) pour détruire les bactéries. Utilisée en dernier recours en Belgique et France." },
    { q:"L'approche 'One Health' nécessite une action sur :", answers:["La santé humaine uniquement","Les hôpitaux uniquement","Santé humaine, animale ET environnementale","La recherche pharmaceutique uniquement"], correct:2, explanation:"One Health relie santé humaine, animale et environnementale. La Belgique a lancé un plan de 260 millions € sur cette base." },
    { q:"Pourquoi peu d'investissement pharmaceutique dans les nouveaux antibiotiques ?", answers:["Techniquement impossible","Faible rentabilité vs médicaments chroniques","Les gouvernements l'interdisent","Toutes les bactéries ont déjà des traitements"], correct:1, explanation:"Les antibiotiques sont pris sur de courtes périodes. Rentabilité faible comparée aux traitements chroniques (cancer, diabète)." },
    { q:"Quelle découverte IA a eu lieu en 2025 contre les superbactéries ?", answers:["Un vaccin universel","La lariocidine, un nouvel antibiotique","Un robot médical","Un test ADN instantané"], correct:1, explanation:"En 2025, l'IA a permis la découverte de la lariocidine, efficace contre des superbactéries quasi intraitables." }
  ],
  current:0, score:0, answered:false,
  start() { this.current=0; this.score=0; this.answered=false; this.showQ(); },
  showQ() {
    const q=this.questions[this.current]; this.answered=false;
    document.getElementById('question-area').textContent=q.q;
    document.getElementById('feedback-area').innerHTML='';
    document.getElementById('feedback-area').style.display='none';
    document.getElementById('quiz-progress-text').textContent=`Question ${this.current+1} / ${this.questions.length}`;
    document.getElementById('quiz-progress-bar').style.width=((this.current/this.questions.length)*100)+'%';
    const aa=document.getElementById('answer-area'); aa.innerHTML='';
    q.answers.forEach((a,i)=>{ const btn=document.createElement('button'); btn.className='answer-btn'; btn.textContent=a; btn.onclick=()=>this.answer(i); aa.appendChild(btn); });
  },
  answer(idx) {
    if(this.answered)return; this.answered=true;
    const q=this.questions[this.current];
    document.querySelectorAll('.answer-btn').forEach(b=>b.disabled=true);
    const fb=document.getElementById('feedback-area'); fb.style.display='';
    if(idx===q.correct){ document.querySelectorAll('.answer-btn')[idx].classList.add('correct'); this.score++; Game.addScore(20); fb.innerHTML=`✅ <strong>Correct !</strong> ${q.explanation}`; }
    else { document.querySelectorAll('.answer-btn')[idx].classList.add('wrong'); document.querySelectorAll('.answer-btn')[q.correct].classList.add('correct'); fb.innerHTML=`❌ <strong>Incorrect.</strong> ${q.explanation}`; }
    setTimeout(()=>{ this.current++; if(this.current<this.questions.length) this.showQ(); else { document.getElementById('quiz-progress-bar').style.width='100%'; setTimeout(()=>Game.showEnd(this.score,this.questions.length),600); } }, 2800);
  }
};
