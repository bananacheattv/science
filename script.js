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
  // Support image field: term.image = URL or base64 data URI
  let imgHtml = '';
  if (term.image) {
    imgHtml = `<div style="margin-top:10px"><img src="${term.image}" alt="Schéma : ${term.title}" class="schema-img" onerror="this.style.display='none'" /></div>`;
  }
  document.getElementById('term-modal-content').innerHTML = `<h3>${term.title}</h3>${term.content}${imgHtml}`;
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
  showEnd(qs, total, difficulty) {
    this.showScreen('screen-end');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('end-score').textContent = this.score;
    const rank = qs>=8 ? '🌟 Expert en Microbiologie' : qs>=5 ? '🔬 Scientifique Confirmé' : '🧫 Apprenti Biologiste';
    const msg  = qs>=8 ? 'Impressionnant ! Tu maîtrises parfaitement les mécanismes de résistance bactérienne.'
                : qs>=5 ? 'Très bien ! Tu comprends les grandes lignes. Continue à approfondir !'
                : 'Bon début ! Relis les niveaux pour mieux comprendre les mécanismes.';
    const cfg = difficulty ? DIFFICULTY_CONFIG[difficulty] : { emoji:'🎯', label:'STANDARD', color:'#00cfff' };
    document.getElementById('end-rank').textContent = rank;
    document.getElementById('end-message').textContent = msg + '\n\nQuiz ' + cfg.emoji + ' ' + cfg.label + ' : '+qs+'/'+total+' bonnes réponses.';
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
// QUIZ FINAL — 3 niveaux de difficulté + roue animée
// ══════════════════════════════════════════════════════════════

const QUIZ_BANKS = {
  facile: [
    { q:"En quelle année Fleming a-t-il découvert la pénicilline ?", answers:["1905","1928","1945","1970"], correct:1, explanation:"En 1928, Fleming observe que Penicillium notatum empêche la croissance de Staphylococcus aureus." },
    { q:"Que fait un antibiotique bactéricide ?", answers:["Bloque la reproduction","Tue directement la bactérie","Renforce l'immunité","Neutralise les virus"], correct:1, explanation:"Bactéricide = tue la bactérie. Bactériostatique = bloque sa reproduction." },
    { q:"Les antibiotiques sont-ils efficaces contre les virus ?", answers:["Oui, toujours","Non, jamais","Parfois","Seulement en hiver"], correct:1, explanation:"Les antibiotiques n'agissent que sur les bactéries, jamais sur les virus comme la grippe ou le rhume." },
    { q:"Quelle est la cible principale des β-lactamines ?", answers:["L'ADN bactérien","La paroi bactérienne","Les ribosomes","La membrane cellulaire"], correct:1, explanation:"Les β-lactamines bloquent la synthèse du peptidoglycane qui compose la paroi bactérienne." },
    { q:"SARM signifie :", answers:["Super Antibiotique Résistant","Staphylococcus aureus Résistant à la Méticilline","Syndrome Aigu de Résistance","Système de Résistance Mutant"], correct:1, explanation:"Le SARM est apparu dès 1961, résiste à toutes les pénicillines classiques." },
    { q:"Combien de décès directs/an dans le monde sont liés aux résistances (OMS 2023) ?", answers:["127 000","1,27 million","10 millions","35 000"], correct:1, explanation:"L'OMS estime 1,27 million de décès directs/an. Sans action, 10 millions d'ici 2050." },
    { q:"La phagothérapie utilise :", answers:["Des plantes médicinales","Des virus bactériophages","Des antibiotiques renforcés","Des nanoparticules"], correct:1, explanation:"Inventée en 1917, la phagothérapie utilise des bactériophages — des virus qui détruisent les bactéries." },
    { q:"Qu'est-ce qu'une bactérie multirésistante (BMR) ?", answers:["Résiste à la chaleur","Résiste à plusieurs familles d'antibiotiques","Plus grande que les autres","Ne se reproduit pas"], correct:1, explanation:"Une BMR résiste à plusieurs familles d'antibiotiques simultanément. Ex : SARM, Pseudomonas aeruginosa." },
    { q:"L'approche 'One Health' relie :", answers:["Hôpitaux et pharmacies","Santé humaine, animale et environnementale","Médecins et vétérinaires","OMS et ONU"], correct:1, explanation:"One Health relie santé humaine, animale et environnementale. La Belgique a lancé un plan de 260 M€ sur cette base." },
    { q:"Les bactéries se divisent environ toutes les :", answers:["2 à 5 heures","20 à 60 minutes","24 heures","1 semaine"], correct:1, explanation:"Certaines espèces se divisent toutes les 20 minutes ! Une bactérie peut devenir 1 milliard en 10h." }
  ],
  moyen: [
    { q:"Qu'est-ce que le transfert horizontal de gènes ?", answers:["Échange d'ADN entre bactéries","Mutation sous effet d'un antibiotique","Reproduction par division","Mécanisme immunitaire humain"], correct:0, explanation:"Le THG permet aux bactéries d'échanger des gènes de résistance via conjugaison, transformation ou transduction." },
    { q:"Quel mécanisme rend une bactérie résistante aux β-lactamines ?", answers:["Mutation de l'ADN gyrase","Production de β-lactamases","Épaississement de la membrane","Augmentation de la reproduction"], correct:1, explanation:"Les β-lactamases sont des enzymes qui coupent le noyau β-lactame de l'antibiotique, le rendant inactif." },
    { q:"Pourquoi peu d'investissement pharma dans les antibiotiques ?", answers:["Techniquement impossible","Faible rentabilité vs médicaments chroniques","Interdiction gouvernementale","Brevets expirés"], correct:1, explanation:"Les antibiotiques sont pris sur de courtes durées. Rentabilité faible vs traitements chroniques (cancer, diabète). Coût : ~1 Md $ pour 1 antibiotique." },
    { q:"Quelle découverte IA a eu lieu en 2025 contre les superbactéries ?", answers:["Un vaccin universel","La lariocidine","Un robot chirurgical","Un test ADN rapide"], correct:1, explanation:"En 2025, l'IA a permis la découverte de la lariocidine, efficace contre des superbactéries quasi intraitables." },
    { q:"Que signifie la zone 'R' sur un antibiogramme ?", answers:["Rapide à traiter","Résistant : l'antibiotique est inefficace","Rare : peu de bactéries","Régulier : dose standard"], correct:1, explanation:"R = Résistant signifie que l'antibiotique ne peut pas éliminer cette bactérie aux concentrations normales." },
    { q:"Comment les animaux d'élevage contribuent-ils à l'antibiorésistance ?", answers:["Ils consomment des médicaments humains","Les antibiotiques utilisés créent des bactéries résistantes transmissibles à l'homme","Ils produisent des antibiotiques naturels","Ils n'y contribuent pas"], correct:1, explanation:"Des bactéries résistantes comme Salmonella ou E. coli ont été retrouvées dans la chaîne alimentaire, issues d'élevages intensifs." },
    { q:"Dès quelle année Fleming a-t-il mis en garde contre la résistance ?", answers:["1928","1945","1960","1980"], correct:1, explanation:"Dans son discours du Prix Nobel en 1945, Fleming alerte déjà sur les dangers d'une mauvaise utilisation de la pénicilline." },
    { q:"Les vaccins contre 23 agents pathogènes pourraient réduire les doses d'antibiotiques de :", answers:["5 %","12 %","22 %","50 %"], correct:2, explanation:"Selon un rapport OMS, les vaccins contre 23 agents pathogènes peuvent réduire de 22% les doses d'antibiotiques nécessaires dans le monde." },
    { q:"Qu'est-ce que la scissiparité ?", answers:["Mode d'alimentation","Division bactérienne en deux cellules filles","Échange de plasmides","Mécanisme de résistance"], correct:1, explanation:"La scissiparité (fission binaire) est le mode de reproduction asexuée des bactéries : 1 → 2 → 4 → 8..." },
    { q:"Pourquoi arrêter un traitement antibiotique trop tôt est dangereux ?", answers:["Les effets secondaires augmentent","Les bactéries les plus résistantes survivent et prolifèrent","L'antibiotique devient toxique","Le corps s'immunise contre l'antibiotique"], correct:1, explanation:"En arrêtant trop tôt, les bactéries les plus résistantes (non éliminées) survivent, se multiplient et transmettent leur résistance." }
  ],
  difficile: [
    { q:"Par quel mécanisme de transfert horizontal une bactérie absorbe-t-elle de l'ADN libre dans l'environnement ?", answers:["Conjugaison","Transduction","Transformation","Traduction"], correct:2, explanation:"La transformation : la bactérie absorbe de l'ADN libre présent dans l'environnement (ex : d'une bactérie morte). Conjugaison = contact direct via pilus. Transduction = via bactériophage." },
    { q:"Qu'est-ce qu'un plasmide dans le contexte de l'antibiorésistance ?", answers:["Un type d'antibiotique","Un fragment d'ADN circulaire extrachromosomique transportant des gènes de résistance","Une structure de la paroi bactérienne","Un virus bactériophage"], correct:1, explanation:"Les plasmides sont des fragments d'ADN circulaires qui peuvent transporter plusieurs gènes de résistance simultanément, favorisant les BMR." },
    { q:"Quel est le mécanisme d'action des β-lactamines au niveau moléculaire ?", answers:["Inhibition de l'ARN polymérase","Fixation sur les protéines de liaison à la pénicilline (PLP) bloquant la synthèse du peptidoglycane","Inhibition de la synthèse protéique au ribosome 50S","Perturbation de la membrane cytoplasmique"], correct:1, explanation:"Les β-lactamines se lient aux PLP (transpeptidases), enzymes clés de la synthèse du peptidoglycane, empêchant la reconstruction de la paroi." },
    { q:"Qu'est-ce qu'une entérobactérie productrice de carbapénémase (EPC) ?", answers:["Une bactérie intestinale sensible à tous les antibiotiques","Une bactérie résistante aux carbapénèmes (antibiotiques de dernier recours) via une enzyme spécifique","Un champignon produisant des antibiotiques","Une bactérie ne vivant que dans les intestins"], correct:1, explanation:"Les EPC produisent des carbapénémases qui détruisent les carbapénèmes, nos antibiotiques de dernier recours. Leur émergence est une menace critique mondiale." },
    { q:"Le concept 'One Health' repose sur quelle observation fondamentale ?", answers:["Les humains sont plus importants que les animaux","La santé humaine, animale et environnementale sont interconnectées et indissociables","Les antibiotiques vétérinaires sont différents des antibiotiques humains","L'OMS doit contrôler tous les pays"], correct:1, explanation:"One Health reconnaît que 60% des maladies infectieuses humaines sont zoonotiques (origine animale) et que l'environnement est un réservoir de gènes de résistance." },
    { q:"Pourquoi les mutations conférant une résistance n'ont-elles pas besoin d'être induites par l'antibiotique ?", answers:["Parce que les antibiotiques guident l'évolution","Parce que des mutations aléatoires préexistent déjà dans la population ; l'antibiotique ne fait que sélectionner celles qui confèrent un avantage","Parce que les bactéries détectent l'antibiotique","Parce que les gènes de résistance viennent toujours d'autres espèces"], correct:1, explanation:"C'est le principe fondamental de la sélection naturelle darwinienne : la variabilité génétique préexiste. L'antibiotique = pression de sélection qui favorise les déjà-résistants." },
    { q:"Quelle famille d'antibiotiques cible les ribosomes 30S des bactéries ?", answers:["β-lactamines","Macrolides","Fluoroquinolones","Aminosides et tétracyclines"], correct:3, explanation:"Les aminosides et tétracyclines ciblent le ribosome 30S. Les macrolides ciblent le 50S. Les fluoroquinolones ciblent l'ADN gyrase. Les β-lactamines ciblent la paroi." },
    { q:"Qu'est-ce qui explique que le SARM est apparu dès 1961, l'année même où la méticilline a été introduite ?", answers:["Pure coïncidence","Des mutations conférant la résistance préexistaient dans certaines souches de S. aureus avant même l'utilisation de la méticilline","La méticilline était de mauvaise qualité","Les chercheurs ont fait une erreur de datation"], correct:1, explanation:"Illustration parfaite de la sélection naturelle : des S. aureus portant déjà le gène mecA (SARM) préexistaient. L'introduction massive de méticilline a sélectionné et amplifié ces souches." },
    { q:"Pourquoi l'hôpital est-il un environnement particulièrement propice à la sélection de bactéries résistantes ?", answers:["Parce que les patients y sont en bonne santé","Combinaison de forte utilisation d'antibiotiques, patients immunodéprimés et transmission croisée intensive","Parce que les hôpitaux sont plus chauds","Parce que les médecins ne se lavent pas les mains"], correct:1, explanation:"L'hôpital concentre les 3 facteurs de sélection : pression antibiotique intense, hôtes fragilisés (moins de compétition avec la flore normale) et densité de patients facilitant la transmission." },
    { q:"Quel inhibiteur de β-lactamase est associé à l'amoxicilline dans l'Augmentin® ?", answers:["Méticilline","Acide clavulanique","Vancomycine","Tazobactam"], correct:1, explanation:"L'amoxicilline + acide clavulanique (Augmentin®) : l'acide clavulanique inhibe les β-lactamases, restaurant l'efficacité de l'amoxicilline contre les bactéries résistantes." }
  ]
};

const DIFFICULTY_CONFIG = {
  facile:    { label:'FACILE',    color:'#00ff88', emoji:'🟢', bonus:10, desc:'Questions de base — idéal pour commencer' },
  moyen:     { label:'MOYEN',     color:'#ffd60a', emoji:'🟡', bonus:20, desc:'Mécanismes et données chiffrées' },
  difficile: { label:'DIFFICILE', color:'#ff4d6d', emoji:'🔴', bonus:30, desc:'Biologie moléculaire et enjeux avancés' }
};

const Quiz = {
  questions:[], current:0, score:0, answered:false,
  difficulty: null, wheelSpinning: false,

  start() {
    this.current=0; this.score=0; this.answered=false; this.difficulty=null;
    this.showWheel();
  },

  showWheel() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div id="wheel-screen" style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:10px 0;">
        <div style="font-family:var(--fd);font-size:clamp(13px,2vw,17px);color:var(--blue);letter-spacing:2px;text-align:center">
          🎰 TIRAGE AU SORT DE LA DIFFICULTÉ
        </div>
        <div style="font-size:clamp(11px,1.6vw,13px);color:var(--dim);text-align:center">La roue choisit ton niveau de défi !</div>
        <div style="position:relative;width:clamp(220px,40vw,300px);height:clamp(220px,40vw,300px)">
          <canvas id="wheel-canvas" width="300" height="300" style="width:100%;height:100%"></canvas>
          <div id="wheel-pointer" style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.8))">▼</div>
        </div>
        <button id="spin-btn" class="btn-primary" style="font-size:clamp(12px,2vw,15px);padding:12px 32px;" onclick="Quiz.spinWheel()">
          🎲 LANCER LA ROUE
        </button>
        <div id="wheel-result" style="font-size:clamp(13px,2vw,16px);color:var(--green);font-family:var(--fd);min-height:40px;text-align:center;letter-spacing:1px"></div>
      </div>`;
    document.getElementById('question-area').innerHTML='';
    document.getElementById('answer-area').innerHTML='';
    document.getElementById('feedback-area').innerHTML='';
    document.getElementById('quiz-progress-text').textContent='Tirage de la difficulté...';
    document.getElementById('quiz-progress-bar').style.width='0%';
    this.drawWheel(0);
  },

  drawWheel(angle) {
    const canvas = document.getElementById('wheel-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx=150, cy=150, r=130;
    const segments = [
      {key:'facile',   label:'FACILE',    color:'#00cc6a', arc: Math.PI*2/3 },
      {key:'moyen',    label:'MOYEN',     color:'#e6c200', arc: Math.PI*2/3 },
      {key:'difficile',label:'DIFFICILE', color:'#cc3344', arc: Math.PI*2/3 },
    ];
    ctx.clearRect(0,0,300,300);

    // Outer glow ring
    ctx.save();
    ctx.shadowColor='rgba(0,207,255,0.35)'; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.arc(cx,cy,r+6,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,207,255,0.4)'; ctx.lineWidth=4; ctx.stroke();
    ctx.restore();

    let a = angle - Math.PI/2; // pointer at top
    segments.forEach(seg => {
      // Segment fill
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,a,a+seg.arc); ctx.closePath();
      ctx.fillStyle = seg.color; ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=2; ctx.stroke();

      // Label
      const mid = a + seg.arc/2;
      ctx.save();
      ctx.translate(cx+Math.cos(mid)*r*.62, cy+Math.sin(mid)*r*.62);
      ctx.rotate(mid+Math.PI/2);
      ctx.fillStyle='#fff'; ctx.font='bold 13px Orbitron';
      ctx.textAlign='center'; ctx.shadowColor='rgba(0,0,0,.6)'; ctx.shadowBlur=4;
      ctx.fillText(seg.label, 0, 0);
      ctx.restore();

      // Emoji
      ctx.save();
      ctx.translate(cx+Math.cos(mid)*r*.85, cy+Math.sin(mid)*r*.85);
      ctx.font='18px serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(DIFFICULTY_CONFIG[seg.key].emoji, 0, 0);
      ctx.restore();

      a += seg.arc;
    });

    // Center circle
    ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2);
    const cg = ctx.createRadialGradient(cx,cy,0,cx,cy,28);
    cg.addColorStop(0,'#1a3060'); cg.addColorStop(1,'#060b1a');
    ctx.fillStyle=cg; ctx.fill();
    ctx.strokeStyle='rgba(0,207,255,0.5)'; ctx.lineWidth=2.5; ctx.stroke();
    ctx.fillStyle='#00cfff'; ctx.font='bold 11px Orbitron';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('GO!', cx, cy);
  },

  spinWheel() {
    if(this.wheelSpinning) return;
    this.wheelSpinning = true;
    document.getElementById('spin-btn').disabled=true;
    document.getElementById('wheel-result').textContent='';

    const difficulties = ['facile','moyen','difficile'];
    const chosen = difficulties[Math.floor(Math.random()*3)];
    // Each segment = 120° = 2π/3 rad
    // Segment positions: facile=0°, moyen=120°, difficile=240° (pointer at top = -90°)
    const segStart = { facile: Math.PI*4/3, moyen: Math.PI*2/3, difficile: 0 };
    const targetAngle = segStart[chosen] + Math.PI/3; // center of segment

    // Spin 5 full rotations + land on chosen segment
    const totalSpin = Math.PI*2*5 + targetAngle;
    let current = 0;
    const duration = 3200;
    const start = performance.now();

    const easeOut = t => 1 - Math.pow(1-t, 4);

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed/duration, 1);
      current = totalSpin * easeOut(t);
      this.drawWheel(current);
      if(t < 1) { requestAnimationFrame(animate); }
      else {
        this.wheelSpinning = false;
        this.difficulty = chosen;
        const cfg = DIFFICULTY_CONFIG[chosen];
        document.getElementById('wheel-result').innerHTML =
          `${cfg.emoji} <strong style="color:${cfg.color}">${cfg.label}</strong> — ${cfg.desc}`;
        document.getElementById('spin-btn').textContent='▶ DÉMARRER LE QUIZ';
        document.getElementById('spin-btn').disabled=false;
        document.getElementById('spin-btn').onclick = () => Quiz.startWithDifficulty(chosen);
      }
    };
    requestAnimationFrame(animate);
  },

  startWithDifficulty(diff) {
    this.difficulty = diff;
    // Pick 10 random questions from the bank
    const bank = [...QUIZ_BANKS[diff]];
    for(let i=bank.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [bank[i],bank[j]]=[bank[j],bank[i]]; }
    this.questions = bank.slice(0,10);
    this.current=0; this.score=0; this.answered=false;

    const cfg = DIFFICULTY_CONFIG[diff];
    // Replace container with quiz UI
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div id="difficulty-badge" style="font-family:var(--fd);font-size:clamp(10px,1.4vw,12px);padding:4px 16px;border-radius:20px;background:${cfg.color}22;border:1px solid ${cfg.color};color:${cfg.color};letter-spacing:2px">
        ${cfg.emoji} MODE ${cfg.label} — Bonus ${cfg.bonus} pts/bonne réponse
      </div>
      <div id="question-area2" style="font-family:var(--fd);font-size:clamp(14px,2.5vw,20px);font-weight:700;text-align:center;color:var(--text);line-height:1.4;padding:0 4px"></div>
      <div id="answer-area2" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(8px,1.5vw,12px);width:100%"></div>
      <div id="feedback-area2" style="background:rgba(0,207,255,.06);border:1px solid var(--border);border-radius:10px;padding:clamp(10px,2vh,14px) clamp(12px,2vw,18px);font-size:clamp(12px,1.7vw,14px);color:var(--text);line-height:1.7;width:100%;min-height:52px;display:none"></div>`;

    document.getElementById('quiz-progress-text').textContent=`Question 1 / ${this.questions.length} — ${cfg.label}`;
    document.getElementById('quiz-progress-bar').style.width='0%';
    this.showQ();
  },

  showQ() {
    const q=this.questions[this.current]; this.answered=false;
    const cfg = DIFFICULTY_CONFIG[this.difficulty];
    document.getElementById('question-area2').textContent=q.q;
    document.getElementById('feedback-area2').style.display='none';
    document.getElementById('quiz-progress-text').textContent=`Question ${this.current+1} / ${this.questions.length} — ${cfg.emoji} ${cfg.label}`;
    document.getElementById('quiz-progress-bar').style.width=((this.current/this.questions.length)*100)+'%';
    const aa=document.getElementById('answer-area2'); aa.innerHTML='';
    q.answers.forEach((a,i)=>{
      const btn=document.createElement('button');
      btn.className='answer-btn'; btn.textContent=a;
      btn.onclick=()=>this.answer(i); aa.appendChild(btn);
    });
  },

  answer(idx) {
    if(this.answered)return; this.answered=true;
    const q=this.questions[this.current];
    const cfg=DIFFICULTY_CONFIG[this.difficulty];
    const btns=document.querySelectorAll('#answer-area2 .answer-btn');
    btns.forEach(b=>b.disabled=true);
    const fb=document.getElementById('feedback-area2'); fb.style.display='';
    if(idx===q.correct){
      btns[idx].classList.add('correct'); this.score++; Game.addScore(cfg.bonus);
      fb.innerHTML=`✅ <strong>Correct !</strong> ${q.explanation}`;
    } else {
      btns[idx].classList.add('wrong'); btns[q.correct].classList.add('correct');
      fb.innerHTML=`❌ <strong>Incorrect.</strong> ${q.explanation}`;
    }
    setTimeout(()=>{
      this.current++;
      if(this.current<this.questions.length) this.showQ();
      else {
        document.getElementById('quiz-progress-bar').style.width='100%';
        setTimeout(()=>Game.showEnd(this.score,this.questions.length,this.difficulty),600);
      }
    }, 2800);
  }
};
