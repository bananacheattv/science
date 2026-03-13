/* ============================================================
   BACTÉROQUEST — script.js v2
   Améliorations :
   - Animations agrandies (canvas 700x420)
   - Niveau 4 dédié à l'antibiogramme
   - Quiz avec sélection de difficulté + tirage au sort
   - Toutes les questions expliquées dans le jeu
   - Termes verts cliquables avec schémas
   ============================================================ */

// ============================================================
// BASE DE CONNAISSANCES — Termes cliquables
// ============================================================
const TERMS = {
  unicellulaire: {
    title: '🦠 Organisme Unicellulaire',
    content: `
      <p>Un organisme unicellulaire est un être vivant composé d'<strong>une seule cellule</strong>. Cette unique cellule remplit toutes les fonctions vitales : se nourrir, se reproduire, réagir à l'environnement.</p>
      <p>Contrairement aux organismes pluricellulaires (comme les humains avec ~37 000 milliards de cellules), les bactéries sont des entités autonomes complètes dans une seule cellule.</p>
      <div class="schema-box"><pre>
  [ Cellule humaine ]     [ Bactérie = 1 seule cellule ]
  
  Corps humain             Une bactérie complète
  37 000 Mrd cellules  →   = 1 cellule autonome
  Cellules spécialisées    Tout en une !
      </pre></div>
    `
  },
  paroi: {
    title: '🏰 La Paroi Bactérienne',
    content: `
      <p>La paroi bactérienne est une structure rigide qui entoure la membrane cellulaire. Elle est composée de <strong>peptidoglycane</strong>, un polymère unique aux bactéries.</p>
      <p>Elle joue un rôle crucial : maintenir la forme de la bactérie, résister à la pression osmotique, et protéger contre l'environnement.</p>
      <p><strong>C'est la cible des β-lactamines</strong> (pénicilline, amoxicilline) : ces antibiotiques bloquent la synthèse du peptidoglycane, fragilisant la paroi jusqu'à la lyse de la bactérie.</p>
      <div class="schema-box"><pre>
  ┌─────────────────────────────┐
  │   PAROI (peptidoglycane)    │ ← cible des β-lactamines
  │  ┌───────────────────────┐  │
  │  │  Membrane cellulaire  │  │
  │  │  ┌─────────────────┐  │  │
  │  │  │  Cytoplasme/ADN │  │  │
  │  │  └─────────────────┘  │  │
  │  └───────────────────────┘  │
  └─────────────────────────────┘
      </pre></div>
    `
  },
  coques: {
    title: '⚪ Les Coques (Bactéries sphériques)',
    content: `
      <p>Les <strong>coques</strong> sont des bactéries de forme sphérique ou ovale. Elles peuvent se regrouper de différentes façons selon l'espèce :</p>
      <div class="schema-box"><pre>
  ●        Monocoque (seule)
  ●●       Diplocoque (par paires)     → ex: Streptococcus pneumoniae
  ●●●●     Streptocoque (chaîne)      → ex: Streptococcus pyogenes
  ⠿        Staphylocoque (grappe)     → ex: Staphylococcus aureus (SARM)
      </pre></div>
      <p>Le <em>Staphylococcus aureus</em> (SARM) est l'un des coques les plus redoutés car il résiste à la méticilline et cause des infections hospitalières graves.</p>
    `
  },
  bacilles: {
    title: '▬ Les Bacilles (Bactéries en bâtonnets)',
    content: `
      <p>Les <strong>bacilles</strong> sont des bactéries en forme de bâtonnet ou de cylindre allongé. Ils peuvent être droits ou incurvés.</p>
      <div class="schema-box"><pre>
  |—|   Bacille simple          → ex: E. coli, Bacillus anthracis
  ~~~   Vibrion (virgule)       → ex: Vibrio cholerae
  ~~~   Spirille (spirale)      → ex: Helicobacter pylori
      </pre></div>
      <p><em>Escherichia coli</em> (E. coli) est le bacille le plus étudié. Présent dans nos intestins, certaines souches résistantes sont responsables d'infections urinaires difficiles à traiter.</p>
    `
  },
  scissiparite: {
    title: '✂️ La Scissiparité (Division binaire)',
    content: `
      <p>La <strong>scissiparité</strong> (ou fission binaire) est le mode de reproduction asexuée des bactéries. La bactérie mère se divise en deux cellules filles identiques.</p>
      <div class="schema-box"><pre>
  Étapes de la division :
  
  1. La bactérie grandit et réplique son ADN
     [●] → [● ●]
  
  2. La membrane se contracte en son milieu
     [●|●]
  
  3. Deux bactéries filles identiques
     [●] + [●]
  
  Temps : 20 à 60 min selon les espèces
      </pre></div>
      <p>Une seule bactérie peut donner <strong>plus d'un milliard</strong> de descendants en 10 heures ! C'est pourquoi les infections peuvent s'aggraver si vite.</p>
    `
  },
  exponentielle: {
    title: '📈 Croissance Exponentielle',
    content: `
      <p>La croissance bactérienne suit une courbe <strong>exponentielle</strong> : à chaque génération, la population double.</p>
      <div class="schema-box"><pre>
  Génération   Bactéries    Temps (~30min/gen)
  0            1            0h
  1            2            0h30
  2            4            1h
  5            32           2h30
  10           1 024        5h
  20           1 048 576    10h
  30           1 073 741 824   15h  → > 1 milliard !
      </pre></div>
      <p>C'est pourquoi il faut <strong>compléter son traitement antibiotique</strong> : même si on se sent mieux après quelques jours, quelques bactéries survivantes peuvent recréer une population entière en quelques heures.</p>
    `
  },
  mutation: {
    title: '🧬 Les Mutations Spontanées',
    content: `
      <p>Lors de la réplication de l'ADN, des <strong>erreurs aléatoires</strong> peuvent se produire : une base est remplacée par une autre, une base est supprimée, ou une nouvelle est insérée.</p>
      <p>La fréquence des mutations est d'environ <strong>1 erreur pour 10⁹ bases copiées</strong>. Avec des milliards de bactéries se divisant très vite, c'est énorme !</p>
      <div class="schema-box"><pre>
  ADN original :  A-T-G-C-C-A-T-G
  Mutation :      A-T-G-C-<strong>T</strong>-A-T-G  ← une base change
  
  → 99% des mutations : neutres ou létales
  → 1% : peuvent conférer un avantage
     ex: résistance à un antibiotique !
      </pre></div>
      <p>La résistance aux antibiotiques <strong>n'est pas causée par les antibiotiques</strong> — elle existait déjà. Les antibiotiques <em>sélectionnent</em> les bactéries déjà résistantes.</p>
    `
  },
  penicilline: {
    title: '🍄 La Pénicilline — Découverte de Fleming',
    content: `
      <p>En <strong>1928</strong>, Alexander Fleming remarque qu'une moisissure (<em>Penicillium notatum</em>) a contaminé une boîte de Petri et a créé une zone sans bactéries autour d'elle.</p>
      <p>Il comprend que la moisissure produit une substance qui tue les bactéries — qu'il nomme <strong>pénicilline</strong>.</p>
      <div class="schema-box"><pre>
  Boîte de Petri de Fleming :
  
  🦠🦠🦠 🦠🦠🦠
  🦠🦠     🦠🦠
  🦠   🍄   🦠   ← moisissure
  🦠🦠     🦠🦠
  🦠🦠🦠 🦠🦠🦠
       ↑
  Zone d'inhibition (sans bactéries)
      </pre></div>
      <p>La pénicilline agit en <strong>bloquant la synthèse de la paroi bactérienne</strong> (peptidoglycane), rendant les bactéries vulnérables à l'éclatement osmotique. Elle n'affecte pas les cellules humaines car nous n'avons pas de paroi bactérienne.</p>
    `
  },
  bacteriostatique: {
    title: '🛡 Antibiotique Bactériostatique',
    content: `
      <p>Un antibiotique <strong>bactériostatique</strong> ne tue pas directement la bactérie : il <em>bloque sa croissance et sa reproduction</em>. Les bactéries restent vivantes mais ne peuvent plus se multiplier.</p>
      <p>Le système immunitaire peut alors les éliminer progressivement.</p>
      <div class="schema-box"><pre>
  Sans antibiotique :   🦠 → 🦠🦠 → 🦠🦠🦠🦠 (multiplication)
  
  Avec bactériostatique :
  🦠 🦠 🦠 🦠   (bloquées, immobiles)
      → système immunitaire les élimine 💪
      </pre></div>
      <p>Exemples : tétracyclines, macrolides, chloramphénicol. Attention : si l'on arrête le traitement trop tôt, les bactéries peuvent reprendre leur multiplication !</p>
    `
  },
  bactericide: {
    title: '⚔️ Antibiotique Bactéricide',
    content: `
      <p>Un antibiotique <strong>bactéricide</strong> tue directement les bactéries en agissant sur des cibles vitales : la paroi, la membrane, l'ADN, ou les ribosomes.</p>
      <div class="schema-box"><pre>
  Mécanismes bactéricides :
  
  ├── 💊 β-lactamines → détruisent la paroi
  ├── 💊 Fluoroquinolones → bloquent l'ADN gyrase
  ├── 💊 Aminosides → perturbent les ribosomes
  └── 💊 Glycopeptides → bloquent le peptidoglycane
  
  Résultat : 🦠 → 💥 (lyse cellulaire)
      </pre></div>
      <p>Les bactéricides sont préférés dans les infections sévères (septicémies, méningites) ou chez les patients immunodéprimés qui ne peuvent pas compter sur leur système immunitaire.</p>
    `
  },
  betalactamines: {
    title: '💊 Les β-lactamines',
    content: `
      <p>Les <strong>β-lactamines</strong> sont la famille d'antibiotiques la plus utilisée au monde. Elles doivent leur nom à leur noyau chimique : le cycle β-lactame.</p>
      <p>Elles agissent en <strong>inhibant la synthèse du peptidoglycane</strong>, composant essentiel de la paroi bactérienne.</p>
      <div class="schema-box"><pre>
  Famille β-lactamines :
  ├── Pénicillines      → pénicilline G, amoxicilline
  ├── Céphalosporines   → céfazoline, céftriaxone
  ├── Carbapénèmes      → méropénème (dernier recours)
  └── Monobactames      → aztréonam
  
  Résistance : les bactéries produisent des β-lactamases
  qui hydrolysent le noyau β-lactame → antibiotique détruit
      </pre></div>
      <p>Pour contrer les β-lactamases, on combine souvent l'antibiotique avec un inhibiteur comme l'<em>acide clavulanique</em> (ex: Augmentin = amoxicilline + acide clavulanique).</p>
    `
  },
  antibiogramme: {
    title: '🧫 L\'Antibiogramme — Technique',
    content: `
      <p>L'antibiogramme est la technique de référence pour guider le médecin dans le choix de l'antibiotique adapté à une infection précise.</p>
      <div class="schema-box"><pre>
  PROTOCOLE ANTIBIOGRAMME :
  
  1. Prélèvement clinique (urine, sang, expectorations...)
         ↓
  2. Mise en culture de la bactérie sur gélose Mueller-Hinton
         ↓
  3. Dépôt de disques d'antibiotiques sur la gélose
         ↓
  4. Incubation 18-24h à 37°C
         ↓
  5. Lecture des zones d'inhibition (diamètre en mm)
         ↓
  6. Interprétation S / I / R selon les tables EUCAST

  Disque AB-1 : zone 25mm → SENSIBLE ✅
  Disque AB-2 : zone 12mm → INTERMÉDIAIRE 🟡
  Disque AB-3 : zone  0mm → RÉSISTANT ❌
      </pre></div>
      <p>Les seuils d'interprétation (S/I/R) sont définis par l'EUCAST (European Committee on Antimicrobial Susceptibility Testing) et mis à jour chaque année.</p>
    `
  },
  zoneInhibition: {
    title: '⭕ Zone d\'Inhibition',
    content: `
      <p>La <strong>zone d'inhibition</strong> (ou auréole d'inhibition) est la zone circulaire et transparente qui se forme autour d'un disque d'antibiotique quand celui-ci est efficace.</p>
      <div class="schema-box"><pre>
  Vue de dessus de la boîte de Petri :
  
  🦠🦠🦠🦠🦠🦠🦠🦠🦠🦠  ← bactéries
  🦠🦠🦠          🦠🦠🦠
  🦠🦠    (zone)    🦠🦠
  🦠      [DISQUE]    🦠  ← disque antibiotique
  🦠🦠    (d'inhibit.)🦠🦠
  🦠🦠🦦          🦠🦠🦠
  🦠🦠🦠🦠🦠🦠🦠🦠🦠🦠
  
  Diamètre mesuré en mm → comparé aux seuils EUCAST
      </pre></div>
      <p>Plus le diamètre est grand, plus l'antibiotique est efficace contre cette souche bactérienne. Si aucune zone ne se forme → bactérie résistante.</p>
    `
  },
  sensible: {
    title: '✅ Catégorie S — Sensible',
    content: `
      <p>Une bactérie est classée <strong>Sensible (S)</strong> lorsque le diamètre de la zone d'inhibition dépasse le seuil défini par l'EUCAST.</p>
      <p>Cela signifie que l'antibiotique peut être utilisé à <strong>doses standard</strong> pour traiter l'infection, avec de grandes chances de succès thérapeutique.</p>
      <div class="schema-box"><pre>
  Exemple — Amoxicilline vs E. coli :
  
  Seuil EUCAST : ≥ 19mm → Sensible
  
  Résultat mesuré : 24mm → ✅ SENSIBLE
  
  → Prescription possible à dose normale
  → Traitement efficace attendu
      </pre></div>
    `
  },
  intermediate: {
    title: '🟡 Catégorie I — Intermédiaire',
    content: `
      <p>La catégorie <strong>Intermédiaire (I)</strong> a été redéfinie par l'EUCAST en 2019 : elle signifie désormais <em>"Sensible à dose augmentée"</em>.</p>
      <p>L'antibiotique peut être utilisé mais à des <strong>doses plus élevées ou dans des sites d'accumulation naturelle</strong> (ex: les quinolones s'accumulent dans les urines — efficaces contre les infections urinaires même en catégorie I).</p>
      <div class="schema-box"><pre>
  Ancienne définition I = "zone grise" (incertitude)
  Nouvelle définition  I = "Sensible à dose augmentée"
  
  Exemples d'utilisation :
  → Augmenter la dose
  → Administrer en perfusion prolongée
  → Exploiter la pharmacocinétique (accumulation locale)
      </pre></div>
    `
  },
  resistant: {
    title: '❌ Catégorie R — Résistant',
    content: `
      <p>Une bactérie est classée <strong>Résistante (R)</strong> quand la zone d'inhibition est inférieure au seuil critique, ou quand elle est nulle.</p>
      <p>Cet antibiotique ne doit <strong>pas être prescrit</strong> pour cette infection — même à forte dose, il n'aura pas d'effet suffisant.</p>
      <div class="schema-box"><pre>
  Conséquences d'une prescription malgré le R :
  
  ❌ Traitement inefficace → aggravation de l'infection
  ❌ Sélection des bactéries résistantes
  ❌ Diffusion possible de la résistance
  
  → L'antibiogramme évite ces erreurs thérapeutiques !
  → Passage obligatoire en 2ème ou 3ème ligne
      </pre></div>
    `
  },
  cmi: {
    title: '⚗️ CMI — Concentration Minimale Inhibitrice',
    content: `
      <p>La <strong>CMI</strong> est la plus petite concentration d'antibiotique capable d'inhiber la croissance bactérienne visible après 18-24h d'incubation.</p>
      <div class="schema-box"><pre>
  Dilutions successives d'antibiotique :
  
  [ 8 mg/L ] → croissance bactérienne 🦠🦠🦠
  [ 4 mg/L ] → croissance bactérienne 🦠🦠
  [ 2 mg/L ] → croissance bactérienne 🦠
  [ 1 mg/L ] → AUCUNE croissance  ← CMI = 1 mg/L
  [ 0.5 mg/L ] → AUCUNE croissance
  
  La CMI guide le choix de la dose thérapeutique.
      </pre></div>
      <p>La <em>CMB</em> (Concentration Minimale Bactéricide) est la plus petite concentration qui tue 99,9% des bactéries. Si CMB/CMI > 4 → antibiotique bactériostatique.</p>
    `
  },
  pressionSelection: {
    title: '🔬 La Pression de Sélection',
    content: `
      <p>La <strong>pression de sélection</strong> est le mécanisme darwinien par lequel un agent extérieur (ici l'antibiotique) favorise la survie des individus les mieux adaptés.</p>
      <div class="schema-box"><pre>
  AVANT antibiotique :
  🟢🟢🟢🟢🔴🟢🟢🟢🟢🟢  (🔴 = 1 bactérie résistante)
  
  PENDANT traitement :
  💀💀💀💀🔴💀💀💀💀💀  (sensibles meurent)
  
  APRÈS traitement :
  🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴  (résistantes prolifèrent)
  
  → Population entièrement résistante !
      </pre></div>
      <p>C'est pourquoi l'utilisation excessive et inadaptée des antibiotiques accélère l'émergence des résistances. Chaque traitement inutile est une opportunité supplémentaire pour la sélection de bactéries résistantes.</p>
    `
  },
  cibleAb: {
    title: '🎯 Modification de la Cible',
    content: `
      <p>Un mécanisme de résistance consiste à <strong>modifier la molécule cible</strong> de l'antibiotique pour que celui-ci ne puisse plus s'y fixer.</p>
      <div class="schema-box"><pre>
  Exemple — SARM (résistance à la méticilline) :
  
  Bactérie sensible :
  Méticilline + PBP2 → PBP2 bloquée → mort bactérie
  
  SARM :
  Le gène mecA code une PBP2a modifiée
  Méticilline + PBP2a → PBP2a non bloquée 
  → bactérie survit et se multiplie !
  
  PBP = Penicillin-Binding Protein
      </pre></div>
      <p>D'autres exemples : modification des topoisomérases (résistance aux fluoroquinolones), modification des ribosomes (résistance aux macrolides).</p>
    `
  },
  betalactamase: {
    title: '🧪 Les β-lactamases',
    content: `
      <p>Les <strong>β-lactamases</strong> sont des enzymes produites par certaines bactéries qui hydrolysent (détruisent) le noyau β-lactame des antibiotiques correspondants, les rendant inactifs.</p>
      <div class="schema-box"><pre>
  Sans β-lactamase :
  💊 (pénicilline) → se lie à la PBP → 🦠 meurt
  
  Avec β-lactamase :
  💊 → β-lactamase → 💊 détruit → 🦠 survit !
  
  Types :
  ├── β-lactamases classiques (pénicillinases)
  ├── BLSE (β-lactamases à spectre élargi)
  │   → résistent à quasi toutes les β-lactamines
  └── Carbapénèmases (KPC, OXA...)
      → résistent aux carbapénèmes = DERNIER RECOURS
      </pre></div>
      <p>La solution : associer l'antibiotique à un <em>inhibiteur de β-lactamase</em> (acide clavulanique, sulbactam, tazobactam) qui "sacrifice" sa propre structure pour protéger l'antibiotique.</p>
    `
  },
  transfertHorizontal: {
    title: '🔄 Transfert Horizontal de Gènes',
    content: `
      <p>Le <strong>transfert horizontal de gènes (THG)</strong> est un échange d'ADN entre bactéries, sans rapport avec la reproduction. Il permet la diffusion rapide des gènes de résistance entre espèces différentes !</p>
      <div class="schema-box"><pre>
  3 mécanismes principaux :
  
  1. CONJUGAISON (contact direct) :
     🦠—pilus—🦠  → transfert de plasmide (ADN extra-chromosomique)
  
  2. TRANSFORMATION (ADN libre) :
     🦠 absorbe ADN libéré par une bactérie morte → 🦠*
  
  3. TRANSDUCTION (via phage/virus) :
     Bactériophage 🦠→🔺→🦠  capture et transfert d'ADN
  
  * Résistance transférée !
      </pre></div>
      <p>Un exemple frappant : une bactérie inoffensive du tube digestif peut recevoir un plasmide de résistance d'une bactérie pathogène et devenir résistante à son tour — puis le transmettre à d'autres.</p>
    `
  },
  sarm: {
    title: '⚠️ SARM — Staphylococcus aureus Résistant à la Méticilline',
    content: `
      <p>Le <strong>SARM</strong> est l'une des "superbactéries" les plus redoutées en milieu hospitalier. Il est résistant à toutes les pénicillines et à la plupart des β-lactamines.</p>
      <div class="schema-box"><pre>
  Chronologie SARM :
  
  1960   : Première souche de SARM identifiée (1 an après
           l'introduction de la méticilline !)
  1980s  : Diffusion dans les hôpitaux du monde entier
  2000s  : Apparition du CA-SARM (communautaire)
  Aujourd'hui : ~33% des S. aureus hospitaliers = SARM
  
  Infections graves : pneumonies, septicémies, endocardites
  
  Traitement de référence : vancomycine (glycopeptide)
  Alternative : linézolide, daptomycine
      </pre></div>
      <p>La prévention repose sur les <em>précautions contact</em> (isolement, gants, blouse), le lavage des mains, et le <em>dépistage à l'admission</em> dans les services à risque.</p>
    `
  }
};

function openTerm(key) {
  const term = TERMS[key];
  if (!term) return;
  const modal = document.getElementById('term-modal');
  document.getElementById('term-modal-content').innerHTML = `<h3>${term.title}</h3>${term.content}`;
  modal.classList.remove('hidden');
}

function closeTerm() {
  document.getElementById('term-modal').classList.add('hidden');
}

// Attach click handlers to all .clickable-term elements
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.clickable-term').forEach(el => {
    el.addEventListener('click', () => openTerm(el.dataset.key));
  });
});

// ============================================================
// GESTIONNAIRE PRINCIPAL DU JEU
// ============================================================
const Game = {
  score: 0,
  currentLevel: 0,
  unlockedLevels: [1],
  xpGoals: { 1: 50, 2: 40, 3: 50, 4: 60, 5: 60, 6: 60 },
  xpCurrent: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  quizDifficulty: 'moyen',

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
    const levels = { 1: Level1, 2: Level2, 3: Level3, 4: Level4, 5: Level5, 6: Level6 };
    if (levels[n]) levels[n].init();
  },

  nextLevel() {
    const next = this.currentLevel + 1;
    if (next <= 6) {
      if (!this.unlockedLevels.includes(next)) this.unlockedLevels.push(next);
      this.unlockNav(next);
      this.goToLevel(next);
    }
  },

  goQuizSelect() {
    this.showScreen('screen-difficulty');
    document.getElementById('hud-level').textContent = 'Q';
    this.updateNavActive('Q');
    this.unlockNav('Q');
  },

  selectDifficulty(level) {
    this.quizDifficulty = level;
    this.showScreen('screen-draw');
    this.runDraw(level);
  },

  runDraw(level) {
    const emojis = ['🦠', '💊', '🧬', '🔬', '⚗️', '🧫', '💉', '🏥'];
    const reel = document.getElementById('slot-reel');
    const result = document.getElementById('draw-result');
    result.classList.add('hidden');
    reel.classList.add('spinning');

    let count = 0;
    const interval = setInterval(() => {
      reel.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      count++;
      if (count > 25) {
        clearInterval(interval);
        reel.classList.remove('spinning');
        const labels = { facile: '🌱 Niveau FACILE', moyen: '⚗️ Niveau MOYEN', difficile: '💀 Niveau DIFFICILE' };
        const counts = { facile: 6, moyen: 8, difficile: 8 };
        reel.textContent = { facile: '🌱', moyen: '⚗️', difficile: '💀' }[level];
        result.innerHTML = `Questions sélectionnées !<br>${labels[level]}<br>${counts[level]} questions tirées au sort`;
        result.classList.remove('hidden');
        document.getElementById('quiz-difficulty-label').textContent = `Quiz — ${labels[level]}`;
        setTimeout(() => {
          this.showScreen('screen-quiz');
          Quiz.start(level);
        }, 2000);
      }
    }, 80);
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
    document.getElementById('end-score').textContent = this.score;
    let rank, msg;
    if (quizScore >= total * 0.8) {
      rank = '🌟 Expert en Microbiologie';
      msg = 'Impressionnant ! Tu maîtrises parfaitement les mécanismes d\'évolution bactérienne et les enjeux de l\'antibiorésistance.';
    } else if (quizScore >= total * 0.5) {
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
    this.xpCurrent = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
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
    { name: 'Staphylococcus aureus', color: '#ffd60a', shape: 'round', info: '<h4>🦠 Staphylococcus aureus</h4><p>Bactérie sphérique (coque). Peut causer des infections cutanées, pulmonaires et sanguines. Le <strong>SARM</strong> en est une souche résistante très redoutée en milieu hospitalier. Résiste à la méticilline grâce au gène <em>mecA</em>.</p>' },
    { name: 'E. coli', color: '#00ff88', shape: 'rod', info: '<h4>🦠 Escherichia coli</h4><p>Bactérie en forme de bâtonnet (bacille). Présente dans nos intestins. Certaines souches produisent des <strong>BLSE</strong> (β-lactamases à spectre élargi) rendant la bactérie résistante à la plupart des β-lactamines. Résistances documentées dans plus de 50% des cas dans certains pays.</p>' },
    { name: 'Pseudomonas', color: '#00cfff', shape: 'rod', info: '<h4>🦠 Pseudomonas aeruginosa</h4><p>Bacille multirésistant par excellence. Il combine plusieurs mécanismes : pompes d\'efflux, modification des porines, production d\'enzymes. L\'antibiogramme est <strong>indispensable</strong> car les résistances sont imprévisibles.</p>' },
    { name: 'Bactérie mutante', color: '#ff4d6d', shape: 'round', info: '<h4>⚠️ Bactérie avec Mutation de Résistance</h4><p>Une mutation spontanée lui a permis de produire une <strong>β-lactamase</strong> — une enzyme qui détruit la pénicilline. Sous pression de sélection antibiotique, elle survivra et se multipliera. C\'est le mécanisme principal d\'émergence de la résistance !</p>' },
    { name: 'Salmonella', color: '#9b5de5', shape: 'rod', info: '<h4>🦠 Salmonella</h4><p>Transmise par les aliments. Des souches résistantes ont été retrouvées dans la chaîne alimentaire — directement liées à l\'usage massif d\'antibiotiques dans les élevages intensifs. Un exemple concret du lien entre santé animale et santé humaine (<em>One Health</em>).</p>' },
  ],

  init() {
    this.canvas = document.getElementById('canvas1');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bacteria = [];
    this.clicked.clear();
    if (this.animId) cancelAnimationFrame(this.animId);

    for (let i = 0; i < 5; i++) {
      const info = this.bacteriaInfos[i];
      this.bacteria.push({
        x: 80 + Math.random() * 540,
        y: 50 + Math.random() * 320,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: 22 + Math.random() * 12,
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
      if (Math.sqrt(dx*dx + dy*dy) < b.r + 12) {
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

    ctx.strokeStyle = 'rgba(0,207,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < c.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

    for (let b of this.bacteria) {
      b.x += b.vx; b.y += b.vy; b.angle += b.aSpeed;
      if (b.x < b.r || b.x > c.width - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > c.height - b.r) b.vy *= -1;

      if (b.pulsing) { b.pulse -= 0.05; if (b.pulse <= 0) b.pulsing = false; }

      const isClicked = this.clicked.has(b.name);
      const scale = 1 + (b.pulsing ? b.pulse * 0.3 : 0);

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.scale(scale, scale);

      const grad = ctx.createRadialGradient(0, 0, b.r * 0.5, 0, 0, b.r * 2);
      grad.addColorStop(0, b.color + '40');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, b.r * 2, 0, Math.PI * 2);
      ctx.fill();

      if (b.shape === 'round') {
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color + (isClicked ? 'cc' : '99');
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = isClicked ? 3 : 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(b.r, 0);
        ctx.bezierCurveTo(b.r + 20, -14, b.r + 34, 14, b.r + 48, 0);
        ctx.strokeStyle = b.color + '80';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.beginPath();
        const w = b.r * 0.65, h = b.r * 1.6;
        ctx.roundRect(-w, -h, w*2, h*2, w);
        ctx.fillStyle = b.color + (isClicked ? 'cc' : '99');
        ctx.fill();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = isClicked ? 3 : 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.bezierCurveTo(14, h + 16, -14, h + 32, 0, h + 48);
        ctx.strokeStyle = b.color + '80';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, b.r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();

      ctx.restore();

      ctx.fillStyle = isClicked ? b.color : 'rgba(255,255,255,0.4)';
      ctx.font = isClicked ? 'bold 11px Exo 2' : '10px Exo 2';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, b.x, b.y + b.r + 16);
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
    this.bacteria.push(this.newBacteria(350, 210, '#00ff88'));
    this.loop();
  },

  newBacteria(x, y, color) {
    return {
      x, y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: 16,
      color,
      age: 0,
      dividing: false,
      divProgress: 0,
      hasMutation: Math.random() < 0.15
    };
  },

  divideBacteria() {
    if (this.bacteria.length >= 48) {
      document.getElementById('division-count').textContent = 'Population maximale atteinte ! (48)';
      return;
    }
    const parent = this.bacteria[Math.floor(Math.random() * this.bacteria.length)];
    parent.dividing = true;
    parent.divProgress = 0;

    setTimeout(() => {
      const mutColor = parent.hasMutation ? '#ff4d6d' : parent.color;
      this.bacteria.push(this.newBacteria(parent.x + 24, parent.y + (Math.random()-0.5)*24, mutColor));
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
    this.bacteria.push(this.newBacteria(350, 210, '#00ff88'));
  },

  loop() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);

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

      const scaleX = b.dividing ? 1 + b.divProgress * 0.5 : 1;
      const scaleY = b.dividing ? 1 - b.divProgress * 0.3 : 1;

      if (b.hasMutation) {
        ctx.beginPath();
        ctx.arc(0, 0, b.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,77,109,0.08)';
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

      ctx.beginPath();
      ctx.arc(0, 0, b.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();

      ctx.restore();

      if (b.hasMutation) {
        ctx.fillStyle = '#ff4d6d';
        ctx.font = 'bold 9px Exo 2';
        ctx.textAlign = 'center';
        ctx.fillText('MUTATION', b.x, b.y - b.r - 5);
      }
    }

    ctx.fillStyle = 'rgba(0,207,255,0.6)';
    ctx.font = 'bold 13px Orbitron';
    ctx.textAlign = 'left';
    ctx.fillText('Population : ' + this.bacteria.length, 12, 24);

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

    for (let i = 0; i < 10; i++) {
      this.bacteria.push({
        x: 50 + Math.random() * 600,
        y: 40 + Math.random() * 340,
        vx: (Math.random()-0.5) * 1.2,
        vy: (Math.random()-0.5) * 1.2,
        r: 16,
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
      if (Math.sqrt(dx*dx + dy*dy) < b.r + 10) {
        if (this.weapon === 'kill') {
          for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            this.particles.push({ x: b.x, y: b.y, vx: Math.cos(angle) * 3, vy: Math.sin(angle) * 3, life: 1, color: '#00ff88' });
          }
          b.alive = false;
          b.alpha = 0;
        } else {
          b.stunned = true;
          b.stunTimer = 200;
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

    ctx.strokeStyle = 'rgba(0,207,255,0.04)';
    for (let x = 0; x < c.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

    this.particles = this.particles.filter(p => p.life > 0);
    for (let p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2,'0');
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.04;
    }

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

      if (b.stunned) {
        ctx.beginPath();
        ctx.arc(0, 0, b.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,207,255,0.15)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.stunned ? '#00cfff99' : '#ffd60a99';
      ctx.fill();
      ctx.strokeStyle = b.stunned ? '#00cfff' : '#ffd60a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, b.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();

      if (b.stunned) {
        ctx.fillStyle = '#00cfff';
        ctx.font = 'bold 9px Exo 2';
        ctx.textAlign = 'center';
        ctx.fillText('BLOQUÉE', 0, -b.r - 5);
      }
      ctx.restore();
    }

    if (!this.weapon) {
      ctx.fillStyle = 'rgba(255,214,10,0.7)';
      ctx.font = '13px Exo 2';
      ctx.textAlign = 'center';
      ctx.fillText('← Sélectionne un antibiotique d\'abord !', c.width/2, c.height - 16);
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================================
// NIVEAU 4 — L'ANTIBIOGRAMME (Nouveau !)
// ============================================================
const Level4 = {
  canvas: null, ctx: null,
  animId: null,
  discs: [],
  identified: 0,
  targetIdentified: 3,

  antibiotics: [
    { name: 'Amoxicilline', shortName: 'AMX', result: 'S', zone: 26, color: '#00ff88', angle: 0 },
    { name: 'Ciprofloxacine', shortName: 'CIP', result: 'S', zone: 22, color: '#00cfff', angle: Math.PI * 2 / 6 },
    { name: 'Méticilline', shortName: 'MET', result: 'R', zone: 0, color: '#ff4d6d', angle: Math.PI * 4 / 6 },
    { name: 'Tétracycline', shortName: 'TET', result: 'I', zone: 14, color: '#ffd60a', angle: Math.PI * 6 / 6 },
    { name: 'Vancomycine', shortName: 'VAN', result: 'S', zone: 18, color: '#9b5de5', angle: Math.PI * 8 / 6 },
    { name: 'Érythromycine', shortName: 'ERY', result: 'R', zone: 0, color: '#ff9f1c', angle: Math.PI * 10 / 6 },
  ],

  selectedDisc: null,
  hoverDisc: null,

  init() {
    this.canvas = document.getElementById('canvas4');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (this.animId) cancelAnimationFrame(this.animId);

    this.identified = 0;
    this.selectedDisc = null;
    this.hoverDisc = null;
    this.discs = this.antibiotics.map(ab => ({
      ...ab,
      revealed: false,
      pulse: 0
    }));

    document.getElementById('btn-next4').disabled = true;
    document.getElementById('btn-next4').classList.remove('glow-pulse');
    document.getElementById('xp4-text').textContent = `Identifie les antibiotiques efficaces (S) — ${this.identified}/${this.targetIdentified}`;

    this.canvas.onclick = (e) => this.onClick(e);
    this.canvas.onmousemove = (e) => this.onHover(e);
    this.canvas.onmouseleave = () => { this.hoverDisc = null; };

    this.loop();
  },

  getDiscPosition(ab) {
    const cx = 350, cy = 210;
    const radius = 145;
    return {
      x: cx + Math.cos(ab.angle - Math.PI / 2) * radius,
      y: cy + Math.sin(ab.angle - Math.PI / 2) * radius
    };
  },

  getZoneRadius(ab) {
    if (ab.zone === 0) return 0;
    return 18 + (ab.zone / 30) * 65;
  },

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (let d of this.discs) {
      const pos = this.getDiscPosition(d);
      const dx = mx - pos.x, dy = my - pos.y;
      if (Math.sqrt(dx*dx+dy*dy) < 22) {
        if (!d.revealed) {
          d.revealed = true;
          d.pulse = 1;
          Game.addScore(15);
          Game.addXP(4, 10);
          if (d.result === 'S') this.identified++;
          document.getElementById('xp4-text').textContent = `Identifié : ${this.discs.filter(dd=>dd.revealed).length}/6 disques — Efficaces (S) : ${this.identified}/${this.targetIdentified}`;
          if (this.identified >= this.targetIdentified && this.discs.filter(dd=>dd.revealed).length >= 4) {
            document.getElementById('btn-next4').disabled = false;
            document.getElementById('btn-next4').classList.add('glow-pulse');
          }
        }
        this.selectedDisc = d;
        break;
      }
    }
  },

  onHover(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    this.hoverDisc = null;
    for (let d of this.discs) {
      const pos = this.getDiscPosition(d);
      const dx = mx - pos.x, dy = my - pos.y;
      if (Math.sqrt(dx*dx+dy*dy) < 22) { this.hoverDisc = d; break; }
    }
    this.canvas.style.cursor = this.hoverDisc ? 'pointer' : 'crosshair';
  },

  loop() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);

    // Fond gélose (beige/crème)
    const gelGrad = ctx.createRadialGradient(350, 210, 10, 350, 210, 300);
    gelGrad.addColorStop(0, 'rgba(240,220,160,0.18)');
    gelGrad.addColorStop(1, 'rgba(200,170,100,0.06)');
    ctx.fillStyle = gelGrad;
    ctx.beginPath();
    ctx.ellipse(350, 210, 300, 200, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,170,100,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label boite
    ctx.fillStyle = 'rgba(200,170,100,0.4)';
    ctx.font = '11px Exo 2';
    ctx.textAlign = 'right';
    ctx.fillText('Gélose Mueller-Hinton', c.width - 16, c.height - 16);

    // Zones d'inhibition (révélées)
    for (let d of this.discs) {
      if (!d.revealed) continue;
      const pos = this.getDiscPosition(d);
      const zr = this.getZoneRadius(d);
      if (zr > 0) {
        const zoneGrad = ctx.createRadialGradient(pos.x, pos.y, 14, pos.x, pos.y, zr);
        zoneGrad.addColorStop(0, 'rgba(240,240,220,0.18)');
        zoneGrad.addColorStop(0.7, 'rgba(240,240,220,0.10)');
        zoneGrad.addColorStop(1, 'rgba(240,240,220,0)');
        ctx.fillStyle = zoneGrad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, zr, 0, Math.PI*2);
        ctx.fill();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = d.color + '60';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Mesure du diamètre
        ctx.strokeStyle = d.color + '80';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos.x - zr, pos.y);
        ctx.lineTo(pos.x + zr, pos.y);
        ctx.stroke();
        ctx.fillStyle = d.color;
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(d.zone > 0 ? d.zone + 'mm' : '0mm', pos.x, pos.y + zr + 13);
      }
    }

    // Croissance bactérienne (points sur la gélose)
    ctx.fillStyle = 'rgba(160,200,100,0.12)';
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rr = Math.random() * 270;
      const bx = 350 + Math.cos(angle) * rr;
      const by = 210 + Math.sin(angle) * rr * 0.67;
      // Vérifier qu'on n'est pas dans une zone d'inhibition
      let inZone = false;
      for (let d of this.discs) {
        if (!d.revealed) continue;
        const pos = this.getDiscPosition(d);
        const zr = this.getZoneRadius(d);
        if (zr > 0) {
          const ddx = bx - pos.x, ddy = by - pos.y;
          if (Math.sqrt(ddx*ddx+ddy*ddy) < zr) { inZone = true; break; }
        }
      }
      if (!inZone) {
        ctx.beginPath();
        ctx.arc(bx, by, 1.5, 0, Math.PI*2);
        ctx.fill();
      }
    }

    // Disques antibiotiques
    for (let d of this.discs) {
      const pos = this.getDiscPosition(d);
      const isHover = this.hoverDisc === d;
      const isSelected = this.selectedDisc === d;

      if (d.pulse > 0) { d.pulse -= 0.03; if (d.pulse < 0) d.pulse = 0; }

      // Disque principal
      ctx.save();
      ctx.translate(pos.x, pos.y);
      if (d.pulse > 0) ctx.scale(1 + d.pulse * 0.3, 1 + d.pulse * 0.3);

      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI*2);
      ctx.fillStyle = d.revealed ? (d.color + 'ee') : 'rgba(50,60,90,0.85)';
      ctx.fill();
      ctx.strokeStyle = isHover ? '#fff' : (d.revealed ? d.color : 'rgba(0,207,255,0.5)');
      ctx.lineWidth = isHover ? 3 : 2;
      ctx.stroke();

      // Abréviation
      ctx.fillStyle = d.revealed ? '#000' : 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 9px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.shortName, 0, 0);
      ctx.textBaseline = 'alphabetic';

      ctx.restore();

      // Résultat S/I/R après révélation
      if (d.revealed) {
        const resultColors = { S: '#00ff88', I: '#ffd60a', R: '#ff4d6d' };
        ctx.fillStyle = resultColors[d.result];
        ctx.font = 'bold 13px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(d.result, pos.x, pos.y - 24);
      }

      // Nom au survol ou si selected
      if (isHover || isSelected) {
        ctx.fillStyle = 'rgba(10,25,55,0.92)';
        ctx.beginPath();
        ctx.roundRect(pos.x - 65, pos.y + 24, 130, d.revealed ? 50 : 30, 6);
        ctx.fill();
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#e0f0ff';
        ctx.font = '11px Exo 2';
        ctx.textAlign = 'center';
        ctx.fillText(d.name, pos.x, pos.y + 38);
        if (d.revealed) {
          const meanings = { S: 'Sensible ✅', I: 'Intermédiaire 🟡', R: 'Résistant ❌' };
          ctx.fillStyle = resultColors[d.result] || '#fff';
          ctx.font = 'bold 11px Exo 2';
          ctx.fillText(meanings[d.result], pos.x, pos.y + 56);
        } else {
          ctx.fillStyle = 'rgba(0,207,255,0.7)';
          ctx.font = '10px Exo 2';
          ctx.fillText('Clique pour révéler', pos.x, pos.y + 52);
        }
      }
    }

    // Titre + instructions
    ctx.fillStyle = 'rgba(0,207,255,0.8)';
    ctx.font = 'bold 13px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('ANTIBIOGRAMME — Staphylococcus aureus', c.width/2, 22);

    this.animId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================================
// NIVEAU 5 — La Résistance aux Antibiotiques (Sélection naturelle)
// ============================================================
const Level5 = {
  canvas: null, ctx: null,
  bacteria: [],
  animId: null,
  generations: 0,
  antibioticActive: false,
  antibioticTimer: 0,
  particles: [],

  init() {
    this.canvas = document.getElementById('canvas5');
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
    for (let i = 0; i < 20; i++) {
      const resistant = Math.random() < 0.2;
      this.bacteria.push({
        x: 40 + Math.random() * 620,
        y: 30 + Math.random() * 360,
        vx: (Math.random()-0.5) * 1.2,
        vy: (Math.random()-0.5) * 1.2,
        r: 14,
        resistant,
        alive: true,
        alpha: 1,
        dying: false,
        dyingTimer: 0
      });
    }
    document.getElementById('resistant-count').textContent = 'Résistantes : ' + this.bacteria.filter(b => b.resistant && b.alive).length;
    document.getElementById('btn-next5').disabled = true;
    document.getElementById('btn-next5').classList.remove('glow-pulse');
    if (this.animId) cancelAnimationFrame(this.animId);
    this.loop();
  },

  addAntibiotic() {
    if (this.antibioticActive) return;
    this.antibioticActive = true;
    this.antibioticTimer = 200;
    this.generations++;

    for (let b of this.bacteria) {
      if (b.alive && !b.resistant) {
        b.dying = true;
        b.dyingTimer = Math.random() * 80 + 20;
      }
    }

    setTimeout(() => {
      const survivors = this.bacteria.filter(b => b.alive && b.resistant);
      const newGen = [];
      for (let s of survivors) {
        if (this.bacteria.length + newGen.length < 40) {
          newGen.push({
            x: s.x + (Math.random()-0.5)*35,
            y: s.y + (Math.random()-0.5)*35,
            vx: (Math.random()-0.5)*1.2,
            vy: (Math.random()-0.5)*1.2,
            r: 14,
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
      Game.addXP(5, 20);

      if (this.generations >= 3 || resistCount > 5) {
        document.getElementById('btn-next5').disabled = false;
        document.getElementById('btn-next5').classList.add('glow-pulse');
      }
    }, 2500);
  },

  loop() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);

    if (this.antibioticActive && this.antibioticTimer > 0) {
      this.antibioticTimer--;
      const intensity = (this.antibioticTimer / 200) * 0.15;
      ctx.fillStyle = `rgba(0, 207, 255, ${intensity})`;
      ctx.fillRect(0, 0, c.width, c.height);
    }

    ctx.strokeStyle = 'rgba(0,207,255,0.04)';
    for (let x = 0; x < c.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

    for (let b of this.bacteria) {
      if (!b.alive) continue;
      if (b.alpha < 1) b.alpha = Math.min(1, b.alpha + 0.03);

      b.x += b.vx; b.y += b.vy;
      if (b.x < b.r || b.x > c.width - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > c.height - b.r) b.vy *= -1;

      if (b.dying) {
        b.dyingTimer--;
        if (b.dyingTimer <= 0) {
          b.alive = false;
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

    ctx.fillStyle = '#00ff88';
    ctx.fillRect(12, c.height - 32, 13, 13);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px Exo 2';
    ctx.textAlign = 'left';
    ctx.fillText('Sensible', 30, c.height - 21);

    ctx.fillStyle = '#ff4d6d';
    ctx.fillRect(110, c.height - 32, 13, 13);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Résistante', 128, c.height - 21);

    if (this.antibioticActive) {
      ctx.fillStyle = '#00cfff';
      ctx.font = 'bold 13px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('💊 ANTIBIOTIQUE EN ACTION...', c.width/2, 22);
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================================
// NIVEAU 6 — Statistiques & Solutions
// ============================================================
const Level6 = {
  revealed: 0,
  total: 6,

  init() {
    this.revealed = 0;
    Game.xpCurrent[6] = 0;
    Game.updateHUD(6);
    document.getElementById('btn-next6').disabled = true;
    document.getElementById('btn-next6').classList.remove('glow-pulse');
    document.querySelectorAll('.stat-value').forEach(v => v.classList.add('hidden-val'));
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
    Game.addXP(6, 10);

    if (this.revealed >= this.total) {
      document.getElementById('btn-next6').disabled = false;
      document.getElementById('btn-next6').classList.add('glow-pulse');
    }
  }
};

// ============================================================
// QUIZ FINAL — Questions par difficulté
// ============================================================
const Quiz = {
  allQuestions: {
    facile: [
      {
        q: "En quelle année Alexander Fleming a-t-il découvert la pénicilline ?",
        answers: ["1905", "1928", "1945", "1963"],
        correct: 1,
        explanation: "En 1928, Fleming observe qu'une moisissure (Penicillium notatum) détruit les bactéries autour d'elle. C'est la découverte de la pénicilline — le premier antibiotique. Fleming, Florey et Chain reçoivent le Prix Nobel en 1945."
      },
      {
        q: "Quelle est la forme d'une bactérie appelée 'coque' ?",
        answers: ["En bâtonnet", "Sphérique", "Spiralée", "Filamenteuse"],
        correct: 1,
        explanation: "Les coques sont des bactéries sphériques ou ovoïdes. Exemple : Staphylococcus aureus (coque en grappe), Streptococcus (coque en chaîne). À l'opposé, les bacilles sont en forme de bâtonnet (ex: E. coli)."
      },
      {
        q: "Que signifie 'bactéricide' pour un antibiotique ?",
        answers: ["Il bloque la croissance bactérienne", "Il tue directement la bactérie", "Il empêche les mutations", "Il renforce le système immunitaire"],
        correct: 1,
        explanation: "Bactéricide = qui tue les bactéries (du latin 'caedere' = tuer). Un bactériostatique bloque la croissance sans tuer. Les bactéricides (pénicillines, céphalosporines) sont préférés dans les infections sévères ou chez les patients immunodéprimés."
      },
      {
        q: "Comment les bactéries se reproduisent-elles ?",
        answers: ["Par fécondation", "Par division cellulaire (scissiparité)", "Par ponte d'œufs", "Par mitose avec noyau"],
        correct: 1,
        explanation: "Les bactéries se reproduisent par scissiparité (fission binaire) : une cellule mère se divise en deux cellules filles identiques. Pas de noyau membranaire — les bactéries sont des procaryotes. Ce processus prend 20 à 60 minutes selon les espèces."
      },
      {
        q: "Quelle famille d'antibiotiques cible la paroi bactérienne ?",
        answers: ["Les macrolides", "Les fluoroquinolones", "Les β-lactamines", "Les aminosides"],
        correct: 2,
        explanation: "Les β-lactamines (pénicillines, céphalosporines, carbapénèmes) bloquent la synthèse du peptidoglycane, composant essentiel de la paroi bactérienne. Elles n'affectent pas les cellules humaines car nous n'avons pas de paroi — c'est leur toxicité sélective."
      },
      {
        q: "Que mesure-t-on lors d'un antibiogramme ?",
        answers: ["La taille des bactéries", "Le diamètre des zones d'inhibition autour des disques", "La résistance au froid", "Le nombre de bactéries présentes"],
        correct: 1,
        explanation: "Dans un antibiogramme par diffusion (méthode des disques), on mesure le diamètre (en mm) des zones sans croissance bactérienne autour de chaque disque d'antibiotique. Ce diamètre est comparé aux seuils EUCAST pour classer la bactérie S, I ou R."
      }
    ],
    moyen: [
      {
        q: "Combien de décès directs par an dans le monde sont liés aux infections résistantes (OMS, 2023) ?",
        answers: ["127 000", "500 000", "1,27 million", "10 millions"],
        correct: 2,
        explanation: "L'OMS estime 1,27 million de décès directement attribuables aux infections résistantes chaque année (données 2019-2023). Sans action mondiale, ce chiffre pourrait atteindre 10 millions par an d'ici 2050 — dépassant le cancer comme cause de mortalité."
      },
      {
        q: "Qu'est-ce que le transfert horizontal de gènes entre bactéries ?",
        answers: ["Un échange d'ADN entre bactéries, parfois d'espèces différentes", "La mutation d'une bactérie sous l'effet d'un antibiotique", "La reproduction d'une bactérie par division", "Un mécanisme de défense immunitaire humain"],
        correct: 0,
        explanation: "Le transfert horizontal permet l'échange de gènes (notamment de résistance) entre bactéries par conjugaison (contact direct via pilus), transformation (absorption d'ADN libre) ou transduction (via un bactériophage). Ce mécanisme contourne les règles de la reproduction classique."
      },
      {
        q: "Qu'est-ce qu'une bactérie multirésistante (BMR) ?",
        answers: ["Une bactérie qui résiste à la chaleur", "Une bactérie résistant à plusieurs familles d'antibiotiques", "Une bactérie plus grande que les autres", "Une bactérie qui ne peut pas se reproduire"],
        correct: 1,
        explanation: "Une BMR (Bactérie Multi-Résistante) résiste à au moins 3 familles d'antibiotiques. Exemples : SARM (résistant aux β-lactamines), EBLSE (résistant aux céphalosporines), Pseudomonas multirésistant. Les XDR (Extensively Drug-Resistant) ne peuvent être traitées que par 1 ou 2 antibiotiques."
      },
      {
        q: "Que signifie la catégorie 'I' (Intermédiaire) dans un antibiogramme (définition EUCAST 2019) ?",
        answers: ["La bactérie est hors zone de test", "L'antibiotique est efficace à dose augmentée ou en site d'accumulation", "Résultat non fiable, à refaire", "L'antibiotique est partiellement détruit"],
        correct: 1,
        explanation: "Depuis 2019, l'EUCAST a redéfini la catégorie I : elle signifie 'Sensible, Exposé à une forte dose' (Susceptible, Increased Exposure). L'antibiotique peut être utilisé si la dose est augmentée ou si le site d'infection permet une accumulation naturelle (ex: quinolones dans les urines)."
      },
      {
        q: "Quel est le SARM ?",
        answers: ["Un antibiotique de nouvelle génération", "Staphylococcus aureus Résistant à la Méticilline", "Un programme de surveillance des résistances", "Une technique de phagothérapie"],
        correct: 1,
        explanation: "Le SARM est Staphylococcus aureus Résistant à la Méticilline. Il possède le gène mecA qui code une protéine de liaison modifiée (PBP2a) insensible aux β-lactamines. Apparu en 1960, il cause des infections graves (septicémies, pneumonies). Traitement : vancomycine."
      },
      {
        q: "La phagothérapie consiste à utiliser :",
        answers: ["Des plantes médicinales contre les bactéries", "Des virus bactériophages pour éliminer les bactéries", "Des antibiotiques de synthèse renforcés", "Des nanoparticules contre les superbactéries"],
        correct: 1,
        explanation: "Inventée en 1917 par Félix d'Hérelle, la phagothérapie utilise des bactériophages (virus spécifiques aux bactéries) pour détruire les infections résistantes. Elle est utilisée en usage compassionnel en Belgique et en France quand tous les antibiotiques ont échoué."
      },
      {
        q: "Quel mécanisme permet à une bactérie de détruire un antibiotique β-lactamine ?",
        answers: ["Modification de la cible PBP", "Production de β-lactamases (enzymes)", "Pompe d'efflux membranaire", "Modification de la perméabilité"],
        correct: 1,
        explanation: "Les β-lactamases sont des enzymes bactériennes qui hydrolysent le noyau β-lactame des antibiotiques correspondants, les inactivant avant qu'ils atteignent leur cible. Les BLSE (β-lactamases à spectre élargi) résistent à quasi toutes les pénicillines et céphalosporines. Solution : associer un inhibiteur de β-lactamase."
      },
      {
        q: "Pourquoi les laboratoires pharmaceutiques investissent-ils peu dans les nouveaux antibiotiques ?",
        answers: ["C'est techniquement impossible", "Faible rentabilité : courts traitements et usage limité", "Les gouvernements l'interdisent", "Toutes les bactéries ont déjà des traitements"],
        correct: 1,
        explanation: "Développer un antibiotique coûte ~1 milliard $ et prend 10+ ans. Mais les antibiotiques se prennent sur de courtes périodes et leur usage doit être limité pour éviter les résistances — rentabilité très faible versus médicaments chroniques (diabète, cancer). Un \"déséquilibre commercial\" que les gouvernements tentent de corriger."
      }
    ],
    difficile: [
      {
        q: "Quelle est la différence entre CMI et CMB en antibiologie ?",
        answers: ["CMI = dose létale, CMB = dose efficace", "CMI bloque la croissance, CMB tue 99,9% des bactéries", "CMI s'applique aux virus, CMB aux bactéries", "Ce sont deux noms pour le même concept"],
        correct: 1,
        explanation: "CMI (Concentration Minimale Inhibitrice) = plus petite concentration bloquant la croissance visible. CMB (Concentration Minimale Bactéricide) = plus petite concentration tuant 99,9% des bactéries. Si CMB/CMI > 4 → antibiotique bactériostatique. Si CMB/CMI ≤ 4 → bactéricide. La CMI est la base de l'interprétation EUCAST."
      },
      {
        q: "Le gène mecA du SARM code pour :",
        answers: ["Une β-lactamase qui détruit la pénicilline", "Une PBP2a modifiée insensible aux β-lactamines", "Une pompe d'efflux qui expulse les antibiotiques", "Une enzyme qui modifie l'ADN bactérien"],
        correct: 1,
        explanation: "Le gène mecA (porté par l'îlot génomique SCCmec) code PBP2a, une Penicillin-Binding Protein modifiée présentant une très faible affinité pour toutes les β-lactamines. La bactérie peut ainsi synthétiser sa paroi même en présence d'antibiotiques. C'est le mécanisme principal du SARM."
      },
      {
        q: "Qu'est-ce qu'une BLSE (β-lactamase à spectre élargi) ?",
        answers: ["Un antibiotique large spectre", "Une enzyme résistant aux inhibiteurs de β-lactamase", "Une enzyme hydrolysant pénicillines ET céphalosporines de 3e génération", "Une mutation chromosomique des bactéries"],
        correct: 2,
        explanation: "Les BLSE sont des β-lactamases capables d'hydrolyser les pénicillines ET les céphalosporines (y compris 3e génération comme céftriaxone). Elles sont généralement inhibées par l'acide clavulanique. Les bactéries BLSE+ nécessitent des carbapénèmes (méropénème) — quasi dernière ligne de défense."
      },
      {
        q: "Selon l'approche 'One Health', la résistance aux antibiotiques nécessite une action sur :",
        answers: ["La santé humaine uniquement", "Les hôpitaux uniquement", "La santé humaine, animale ET environnementale", "La recherche pharmaceutique uniquement"],
        correct: 2,
        explanation: "Le concept 'One Health' (OMS, FAO, OIE) reconnait l'interdépendance santé humaine-animale-environnementale. 70% des antibiotiques mondiaux sont utilisés en élevage. Les résistances circulent entre humains, animaux et environnement (eau, sol). La Belgique a lancé un plan 260M€ basé sur cette approche (2026-2030)."
      },
      {
        q: "Quelle découverte liée à l'IA a eu lieu en 2025 pour lutter contre les superbactéries ?",
        answers: ["Un vaccin universel anti-bactérien", "La lariocidine, un nouvel antibiotique contre des superbactéries quasi intraitables", "Un robot médical pour détecter les résistances", "Un test ADN instantané sur smartphone"],
        correct: 1,
        explanation: "En 2025, la lariocidine a été découverte grâce à l'IA (deep learning sur bases de données génomiques). Elle cible un mécanisme de traduction bactérien différent — efficace contre des souches résistantes quasi intraitables. D'autres IA ont découvert des candidats contre la gonorrhée et le SARM la même année."
      },
      {
        q: "Quel est l'avantage du séquençage génomique rapide sur les antibiogrammes classiques ?",
        answers: ["Il est moins cher", "Il identifie tous les gènes de résistance en quelques heures vs 24-48h pour la culture", "Il ne nécessite pas de prélèvement", "Il peut être réalisé sans laboratoire"],
        correct: 1,
        explanation: "Le séquençage génomique (WGS - Whole Genome Sequencing) identifie directement les gènes de résistance (mecA, blaCTX-M, vanA...) en 4-6h versus 18-48h pour un antibiogramme classique. Il permet aussi le typage épidémiologique (traçage des clusters en hôpital). Inconvénient actuel : coût et interprétation complexe."
      },
      {
        q: "Combien coûte approximativement le développement d'un nouvel antibiotique et combien de temps prend-il ?",
        answers: ["100 millions € / 3 ans", "500 millions € / 7 ans", "1 milliard $ / plus de 10 ans", "2 milliards $ / 5 ans"],
        correct: 2,
        explanation: "Développer un nouvel antibiotique coûte environ 1 milliard de dollars et nécessite plus de 10 ans (phases de recherche fondamentale, essais précliniques, phases I/II/III, autorisation de mise sur le marché). Ce coût combiné à la faible rentabilité explique le désengagement des grands laboratoires pharmaceutiques depuis les années 1990."
      },
      {
        q: "Que désigne le terme 'pression de sélection' en lien avec les antibiotiques ?",
        answers: ["La pression osmotique sur la paroi bactérienne", "L'avantage sélectif que procure la résistance aux bactéries exposées aux antibiotiques", "Le dosage maximal toléré par un patient", "La résistance d'une bactérie à la chaleur"],
        correct: 1,
        explanation: "La pression de sélection désigne l'avantage de survie que confère la résistance dans un environnement où l'antibiotique est présent. Les bactéries sensibles meurent, les résistantes (même rares initialement) survivent et se multiplient pour dominer la population — sélection darwinienne. C'est pourquoi l'usage excessif d'antibiotiques accelere l'émergence des résistances."
      }
    ]
  },

  selectedQuestions: [],
  current: 0,
  score: 0,
  answered: false,
  difficulty: 'moyen',
  xpPerAnswer: 20,

  start(difficulty) {
    this.difficulty = difficulty;
    this.current = 0;
    this.score = 0;
    this.answered = false;
    const xpMap = { facile: 10, moyen: 20, difficile: 30 };
    this.xpPerAnswer = xpMap[difficulty] || 20;

    // Tirage au sort : mélanger et sélectionner
    const pool = [...this.allQuestions[difficulty]];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.selectedQuestions = pool; // Toutes les questions de ce niveau

    this.showQuestion();
  },

  showQuestion() {
    const q = this.selectedQuestions[this.current];
    this.answered = false;

    document.getElementById('question-area').textContent = q.q;
    document.getElementById('feedback-area').textContent = '';
    document.getElementById('explanation-area').classList.add('hidden');
    document.getElementById('btn-next-question').classList.add('hidden');
    document.getElementById('quiz-progress-text').textContent = `Question ${this.current + 1} / ${this.selectedQuestions.length}`;
    document.getElementById('quiz-progress-bar').style.width = ((this.current / this.selectedQuestions.length) * 100) + '%';

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
    const q = this.selectedQuestions[this.current];
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(b => b.disabled = true);

    const isCorrect = idx === q.correct;
    if (isCorrect) {
      btns[idx].classList.add('correct');
      this.score++;
      Game.addScore(this.xpPerAnswer);
      document.getElementById('feedback-area').innerHTML = `✅ <strong>Correct !</strong>`;
    } else {
      btns[idx].classList.add('wrong');
      btns[q.correct].classList.add('correct');
      document.getElementById('feedback-area').innerHTML = `❌ <strong>Incorrect.</strong>`;
    }

    // Afficher explication immédiatement
    const expBox = document.getElementById('explanation-area');
    expBox.innerHTML = `<strong>💡 Explication :</strong> ${q.explanation}`;
    expBox.classList.remove('hidden');

    // Bouton suivant
    const btnNext = document.getElementById('btn-next-question');
    btnNext.classList.remove('hidden');
    btnNext.textContent = this.current + 1 < this.selectedQuestions.length ? 'Question suivante ➜' : 'Voir les résultats 🏆';
  },

  nextQuestion() {
    this.current++;
    if (this.current < this.selectedQuestions.length) {
      this.showQuestion();
    } else {
      document.getElementById('quiz-progress-bar').style.width = '100%';
      Game.showEnd(this.score, this.selectedQuestions.length);
    }
  }
};

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.clickable-term').forEach(el => {
    el.addEventListener('click', () => openTerm(el.dataset.key));
  });
  console.log('🦠 BactéroQuest v2 chargé !');
});
