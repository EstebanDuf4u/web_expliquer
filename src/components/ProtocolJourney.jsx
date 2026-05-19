/**
 * ProtocolJourney.jsx — "Le Grand Voyage du Paquet"
 *
 * Deux paquets distincts voyagent aller-retour entre l'ordi et le serveur.
 * Animation lente et fluide pilotée via useAnimation().
 * Speech bubbles, fond animé, langage humain.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES
// ─────────────────────────────────────────────────────────────────────────────
const PROTOCOLS = {
  https: {
    id: 'https', name: 'HTTPS', emoji: '🔒',
    tagline: 'La version blindée — tout est chiffré',
    requestColor:  'from-emerald-400 to-teal-500',
    responseColor: 'from-teal-300 to-emerald-400',
    badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700',
    btnClass: 'bg-emerald-500 hover:bg-emerald-600',
    computerBubbles: {
      sending:  '🔒 "Hey serveur ! Voilà ma demande chiffrée…"',
      done:     '✅ "Merci ! Page bien reçue, et personne n\'a pu lire nos échanges !"',
    },
    serverBubbles: {
      received:   '📬 "Reçu ! Je déchiffre et je prépare ta réponse…"',
      responding: '📤 "Tiens ! Réponse chiffrée, rien que pour toi 🔒"',
    },
    steps: [
      { emoji: '🤝', label: 'Poignée de main (TLS Handshake)', note: 'Les deux appareils s\'échangent des clés secrètes sans jamais les envoyer en clair sur le réseau.', detail: 'Avant d\'envoyer quoi que ce soit, l\'ordi et le serveur s\'échangent des "clés" pour chiffrer la conversation. C\'est comme décider d\'un code secret avant de parler.' },
      { emoji: '🔐', label: 'La demande part, chiffrée',       note: 'Le paquet voyage sous forme chiffrée — un espion ne verrait qu\'une suite aléatoire de caractères sans signification.',  detail: 'Ton message est transformé en charabia illisible. Un espion sur le réseau verrait juste du bruit. Seul le serveur peut le décoder.' },
      { emoji: '⚙️',  label: 'Le serveur travaille…',          note: 'Le serveur déchiffre ta demande, trouve la ressource demandée, et prépare une réponse elle aussi chiffrée.',            detail: 'Le serveur reçoit, déchiffre ta demande, cherche ce qu\'il te faut, et prépare une réponse — elle aussi chiffrée !' },
      { emoji: '🎁', label: 'La réponse revient en sécurité', note: 'La réponse arrive chiffrée — ton navigateur la décode en arrière-plan et la page s\'affiche instantanément.',           detail: 'La réponse fait le chemin inverse, chiffrée de bout en bout. Ton navigateur la déchiffre et affiche la page.' },
    ],
    infoType: 'success',
    infoText: 'Le cadenas 🔒 dans la barre d\'adresse signifie HTTPS. Tes données voyagent dans un tunnel invisible — illisibles pour tout le monde sauf toi et le serveur.',
  },
  http: {
    id: 'http', name: 'HTTP', emoji: '📦',
    tagline: 'La version basique — tout voyage en clair',
    requestColor:  'from-blue-400 to-sky-500',
    responseColor: 'from-sky-300 to-blue-400',
    badgeBg: 'bg-blue-50', badgeText: 'text-blue-700',
    btnClass: 'bg-blue-500 hover:bg-blue-600',
    computerBubbles: {
      sending:  '📤 "Hey serveur ! Voilà ma demande… (tout le monde peut lire !)"',
      done:     '📬 "Reçu ! Mais quelqu\'un aurait pu intercepter nos échanges…"',
    },
    serverBubbles: {
      received:   '📬 "Reçu ! Je prépare ta réponse… (sans protection)"',
      responding: '📤 "Voilà ta réponse ! En clair, pour tout le monde 👀"',
    },
    steps: [
      { emoji: '📤', label: 'La demande part… en clair',   note: 'Comme une carte postale sans enveloppe — tout le monde sur le réseau peut lire le contenu en transit.',              detail: 'Ton message voyage sur le réseau comme une carte postale : n\'importe qui peut la lire en chemin. Pas terrible pour les mots de passe…' },
      { emoji: '👀', label: 'Quelqu\'un peut espionner',   note: 'Sur un Wi-Fi public, un pirate peut capturer tes échanges HTTP avec un simple logiciel gratuit, en silence.',       detail: 'Sur un Wi-Fi public, un "homme au milieu" peut capturer tous tes échanges HTTP. C\'est pour ça qu\'on préfère HTTPS aujourd\'hui.' },
      { emoji: '⚙️',  label: 'Le serveur traite la demande', note: 'Le serveur répond normalement, mais la réponse sera elle aussi envoyée sans la moindre protection.',              detail: 'Le serveur reçoit ta requête et prépare la réponse. Rien de chiffré de son côté non plus.' },
      { emoji: '📬', label: 'La réponse revient… en clair', note: 'La réponse arrive sans chiffrement. N\'entre jamais un identifiant ou un mot de passe sur un site en HTTP.',      detail: 'La réponse aussi voyage sans protection. Pour les sites sans données sensibles, c\'est acceptable. Pour le reste ? Non.' },
    ],
    infoType: 'warning',
    infoText: 'HTTP sans "S" = danger. Ne saisis jamais un mot de passe sur un site en HTTP. Vérifie toujours que l\'URL commence par https://.',
  },
  tcp: {
    id: 'tcp', name: 'TCP/IP', emoji: '📬',
    tagline: 'La fondation — chaque paquet est accusé de réception',
    requestColor:  'from-violet-400 to-purple-500',
    responseColor: 'from-purple-300 to-violet-400',
    badgeBg: 'bg-violet-50', badgeText: 'text-violet-700',
    btnClass: 'bg-violet-500 hover:bg-violet-600',
    computerBubbles: {
      sending:  '👋 "SYN — Hé serveur, t\'es disponible ?"',
      done:     '🎉 "Connexion établie ! On peut se parler librement maintenant !"',
    },
    serverBubbles: {
      received:   '✋ "SYN-ACK — Oui je suis là ! Et toi tu reçois bien ?"',
      responding: '👍 "ACK — Parfait, connexion confirmée. Envoyons les données !"',
    },
    steps: [
      { emoji: '👋', label: 'SYN — "T\'es là ?"',          note: 'Ton ordi frappe à la porte du serveur avec un signal "SYN" — comme demander "Tu es libre avant qu\'on parle ?"',              detail: 'Ton ordi envoie un petit signal "SYN" (Synchronize). C\'est comme frapper à une porte pour demander si quelqu\'un est là.' },
      { emoji: '✋', label: 'SYN-ACK — "Oui, et toi ?"',  note: 'Le serveur répond qu\'il est disponible et vérifie à son tour que la connexion fonctionne dans les deux sens.',                  detail: 'Le serveur répond "SYN-ACK" : "Je t\'entends, et tu m\'entends aussi ?" C\'est la deuxième étape du fameux 3-way handshake.' },
      { emoji: '👍', label: 'ACK — "C\'est parti !"',      note: 'Ton ordi confirme, la connexion est établie. Ce dialogue en 3 étapes s\'appelle le "3-way handshake" — la fondation de TCP.', detail: 'Ton ordi confirme avec un "ACK" (Acknowledged). La connexion est établie ! HTTP, HTTPS et la plupart des protocoles utilisent TCP en dessous.' },
      { emoji: '📦', label: 'Les données s\'échangent',    note: 'TCP vérifie que chaque morceau arrive à destination. Les paquets perdus en chemin sont automatiquement renvoyés.',             detail: 'TCP garantit que chaque paquet arrive bien, dans le bon ordre, et sans erreur. Si un paquet se perd, il est renvoyé automatiquement.' },
    ],
    infoType: 'info',
    infoText: 'TCP c\'est la "Poste Recommandée" d\'Internet. Chaque paquet envoyé doit être confirmé par le destinataire. Rien ne disparaît sans être renvoyé.',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

/** SVG Ordinateur — s'allume selon la phase */
function Computer({ lit }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.svg
        viewBox="0 0 96 80" fill="none"
        className="w-24 h-20 drop-shadow-sm"
        animate={{ filter: lit ? 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' : 'none' }}
      >
        {/* Écran */}
        <rect x="2" y="2" width="92" height="58" rx="7"
          fill={lit ? '#DBEAFE' : '#F1F5F9'}
          stroke={lit ? '#60A5FA' : '#CBD5E1'} strokeWidth="3" />
        {/* Zone affichage */}
        <rect x="10" y="10" width="76" height="42" rx="4"
          fill={lit ? '#EFF6FF' : '#F8FAFC'} />
        {/* Lignes de "contenu" */}
        <motion.rect x="18" y="20" width="36" height="3.5" rx="2"
          fill={lit ? '#93C5FD' : '#E2E8F0'}
          animate={{ width: lit ? [36, 48, 36] : 36 }}
          transition={{ duration: 2, repeat: lit ? Infinity : 0, ease: 'easeInOut' }} />
        <rect x="18" y="28" width="24" height="3.5" rx="2" fill={lit ? '#BFDBFE' : '#E2E8F0'} />
        <rect x="18" y="36" width="30" height="3.5" rx="2" fill={lit ? '#BFDBFE' : '#E2E8F0'} />
        {/* Pied */}
        <rect x="40" y="60" width="16" height="8" rx="3" fill={lit ? '#93C5FD' : '#CBD5E1'} />
        {/* Base */}
        <rect x="26" y="68" width="44" height="6" rx="3" fill={lit ? '#60A5FA' : '#94A3B8'} />
      </motion.svg>
      <p className="text-xs font-700 text-slate-500 text-center leading-tight">
        Ton<br/>Ordinateur
      </p>
    </div>
  )
}

/** SVG Serveur — clignotement LED quand processing */
function Server({ lit, processing }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.svg
        viewBox="0 0 88 96" fill="none"
        className="w-22 h-24 drop-shadow-sm"
        style={{ width: '5.5rem', height: '6rem' }}
        animate={{ filter: lit ? 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' : 'none' }}
      >
        {/* Boîtier */}
        <rect x="4" y="4" width="80" height="88" rx="9"
          fill={lit ? '#D1FAE5' : '#F1F5F9'}
          stroke={lit ? '#34D399' : '#CBD5E1'} strokeWidth="3" />
        {/* 4 unités rack */}
        {[14, 32, 50, 68].map((y, i) => (
          <g key={i}>
            <rect x="12" y={y} width="64" height="13" rx="4"
              fill={lit ? '#A7F3D0' : '#E2E8F0'} />
            {/* Voyant LED */}
            <motion.circle cx="65" cy={y + 6.5} r="4"
              fill={processing ? '#10B981' : lit ? '#6EE7B7' : '#94A3B8'}
              animate={processing ? { opacity: [1, 0.2, 1], r: [4, 5, 4] } : {}}
              transition={{ duration: 0.6, repeat: processing ? Infinity : 0 }}
            />
            {/* Grilles ventilation */}
            {[20, 25, 30, 35].map(x => (
              <rect key={x} x={x} y={y + 4} width="2" height="5" rx="1"
                fill={lit ? '#6EE7B7' : '#CBD5E1'} />
            ))}
          </g>
        ))}
      </motion.svg>
      <p className="text-xs font-700 text-slate-500 text-center leading-tight">
        Le<br/>Serveur
      </p>
    </div>
  )
}

/** Bulle de dialogue avec triangle directionnel */
function SpeechBubble({ text, side, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`
            absolute top-0 z-30 max-w-[200px]
            bg-white border border-slate-200 rounded-2xl shadow-lg
            px-3 py-2 text-xs font-600 text-slate-700 leading-snug
            ${side === 'left' ? 'left-0' : 'right-0'}
          `}
        >
          {text}
          {/* Triangle pointant vers le bas */}
          <span className={`
            absolute -bottom-2 w-3 h-2 overflow-hidden
            ${side === 'left' ? 'left-6' : 'right-6'}
          `}>
            <span className="block w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45 -translate-y-1.5 translate-x-0" />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** La boîte / paquet qui voyage — avec indicateur de direction */
function PacketBox({ gradient, direction, label }) {
  return (
    <div className={`
      w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient}
      flex flex-col items-center justify-center
      shadow-lg text-white select-none
    `}>
      <span className="text-lg leading-none">
        {direction === 'request' ? '📤' : '📥'}
      </span>
      <span className="text-[9px] font-800 mt-0.5 opacity-90 tracking-wide">
        {direction === 'request' ? 'REQUÊTE' : 'RÉPONSE'}
      </span>
      {/* Flèche de direction */}
      <span className="text-[10px] font-900 opacity-70 -mt-0.5">
        {direction === 'request' ? '→' : '←'}
      </span>
    </div>
  )
}

/** Carte d'étape dans la timeline */
function StepCard({ step, index, isActive, isDone, proto }) {
  return (
    <motion.div
      animate={{
        opacity: isActive ? 1 : isDone ? 0.7 : 0.35,
        x: isActive ? 4 : 0,
      }}
      transition={{ duration: 0.4 }}
      className={`
        flex gap-3 p-3.5 rounded-2xl border-2 transition-colors duration-400
        ${isActive
          ? `${proto.badgeBg} border-current ${proto.badgeText}`
          : isDone
            ? 'bg-slate-50 border-slate-200'
            : 'bg-white border-slate-100'
        }
      `}
    >
      {/* Indicateur numéroté */}
      <div className={`
        w-9 h-9 rounded-full shrink-0
        flex items-center justify-center text-sm font-800
        transition-colors duration-300
        ${isActive
          ? `bg-gradient-to-br ${proto.requestColor} text-white shadow-md`
          : isDone
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-slate-100 text-slate-400'
        }
      `}>
        {isDone && !isActive ? '✓' : step.emoji}
      </div>

      <div className="min-w-0">
        <p className={`text-sm font-700 ${isActive ? '' : 'text-slate-600'}`}>
          {step.label}
        </p>
        <AnimatePresence>
          {isActive && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="text-xs text-slate-500 font-500 leading-relaxed overflow-hidden"
            >
              {step.detail}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ProtocolJourney() {
  const [protocol,    setProtocol]    = useState('https')
  const [phase,       setPhase]       = useState('idle')
  const [currentStep, setCurrentStep] = useState(-1)
  const [bubble,      setBubble]      = useState({ left: null, right: null })

  // Contrôleurs d'animation indépendants pour chaque paquet
  const reqControls = useAnimation()
  const resControls = useAnimation()

  const proto      = PROTOCOLS[protocol]
  const isRunning  = !['idle', 'done'].includes(phase)

  // ── Réinitialise les deux paquets hors-écran ────────────────────────────
  async function resetPackets() {
    await Promise.all([
      reqControls.set({ left: '10%', opacity: 0, scale: 0 }),
      resControls.set({ left: '78%', opacity: 0, scale: 0 }),
    ])
  }

  // ── Animation principale ─────────────────────────────────────────────────
  async function handleSend() {
    if (isRunning) return

    await resetPackets()
    setCurrentStep(-1)
    setBubble({ left: null, right: null })
    setPhase('sending')
    setCurrentStep(0)

    // ── 1. Apparition du paquet de requête à l'ordi ──────────────────────
    setBubble({ left: proto.computerBubbles.sending, right: null })
    await reqControls.start({
      opacity: 1, scale: 1,
      transition: { duration: 0.4, ease: 'backOut' },
    })

    await delay(700)

    // ── 2. Voyage aller : ordi → serveur (lent et fluide) ────────────────
    await reqControls.start({
      left: '78%',
      transition: { duration: 3.2, ease: [0.45, 0.05, 0.55, 0.95] },
    })

    // ── 3. Arrivée au serveur — bulle ordi reste 2s avant de changer ────────
    setCurrentStep(1)
    setPhase('server-received')
    await delay(2200)                    // laisser lire la bulle de l'ordi

    setBubble({ left: null, right: proto.serverBubbles.received })
    await delay(500)

    // Fait disparaître le paquet de requête au serveur
    await reqControls.start({
      opacity: 0, scale: 0.4,
      transition: { duration: 0.4 },
    })

    // ── 4. Traitement serveur ─────────────────────────────────────────────
    setCurrentStep(2)
    setPhase('processing')
    await delay(2400)                    // laisser lire "je déchiffre et prépare"

    // ── 5. Change la bulle AVANT que le paquet de retour n'apparaisse ─────
    setCurrentStep(3)
    setPhase('returning')
    setBubble({ left: null, right: proto.serverBubbles.responding })
    await delay(1400)                    // laisser lire "tiens ta réponse" avant le départ

    await resControls.start({
      opacity: 1, scale: 1,
      transition: { duration: 0.4, ease: 'backOut' },
    })

    await delay(400)

    // ── 6. Voyage retour : serveur → ordi (lent et fluide) ───────────────
    await resControls.start({
      left: '10%',
      transition: { duration: 3.2, ease: [0.45, 0.05, 0.55, 0.95] },
    })

    // ── 7. Réception côté ordi ────────────────────────────────────────────
    setPhase('done')
    setBubble({ left: proto.computerBubbles.done, right: null })

    await delay(600)
    // Fait disparaître le paquet de réponse
    await resControls.start({
      opacity: 0, scale: 0.4,
      transition: { duration: 0.4 },
    })

    // Auto-reset après 5 s
    await delay(5000)
    setPhase('idle')
    setCurrentStep(-1)
    setBubble({ left: null, right: null })
  }

  // ── Changer de protocole ─────────────────────────────────────────────────
  function handleProtocolChange(id) {
    if (isRunning) return
    setProtocol(id)
    setPhase('idle')
    setCurrentStep(-1)
    setBubble({ left: null, right: null })
    resetPackets()
  }

  // ── Reset manuel ─────────────────────────────────────────────────────────
  function handleReset() {
    setPhase('idle')
    setCurrentStep(-1)
    setBubble({ left: null, right: null })
    resetPackets()
  }

  // ── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* ── EN-TÊTE ────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-700 mb-3 ${proto.badgeBg} ${proto.badgeText}`}>
          📡 Module 1
        </div>
        <h2 className="text-3xl font-900 text-slate-800 mb-2">
          Le Grand Voyage du Paquet
        </h2>
        <p className="text-slate-500 font-500 text-lg">
          Chaque clic sur un lien déclenche un aller-retour entre toi et un serveur quelque part dans le monde. Regarde comment ça se passe !
        </p>
      </div>

      {/* ── SÉLECTEUR DE PROTOCOLE ─────────────────────────────────────── */}
      <div className="card mb-6">
        <p className="text-sm font-700 text-slate-400 uppercase tracking-wide mb-4">
          Quel protocole veux-tu observer ?
        </p>
        <div className="grid grid-cols-3 gap-3">
          {Object.values(PROTOCOLS).map(p => (
            <button
              key={p.id}
              onClick={() => handleProtocolChange(p.id)}
              disabled={isRunning}
              className={`
                flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left
                transition-all duration-200 font-600
                disabled:opacity-40 disabled:cursor-not-allowed
                ${protocol === p.id
                  ? `bg-gradient-to-br ${p.requestColor} text-white border-transparent shadow-lg scale-105`
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <span className="text-2xl leading-none">{p.emoji}</span>
              <span className="font-800 text-base">{p.name}</span>
              <span className={`text-xs leading-tight ${protocol === p.id ? 'opacity-80' : 'text-slate-400'}`}>
                {p.tagline}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SCÈNE D'ANIMATION ──────────────────────────────────────────── */}
      <div className="card mb-5 overflow-hidden p-0">
        {/* Fond dégradé "ciel" */}
        <div className={`
          relative bg-gradient-to-b from-sky-50 via-white to-slate-50
          pt-10 pb-6 px-6
        `}>

          {/* Speech bubbles — niveau supérieur */}
          <div className="relative h-12 mb-2 select-none pointer-events-none">
            <SpeechBubble text={bubble.left}  side="left"  visible={!!bubble.left} />
            <SpeechBubble text={bubble.right} side="right" visible={!!bubble.right} />
          </div>

          {/* ── Scène centrale avec paquets ── */}
          <div className="relative h-36 select-none">

            {/* Ordi — gauche */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <Computer lit={phase === 'returning' || phase === 'done'} />
            </div>

            {/* Serveur — droite */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <Server
                lit={phase === 'server-received' || phase === 'processing' || phase === 'returning'}
                processing={phase === 'processing'}
              />
            </div>

            {/* ── Route / Rail entre les deux ── */}
            <div className="absolute left-28 right-28 top-1/2 -translate-y-1/2">
              {/* Ligne de base */}
              <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                {/* Trace animée du paquet qui passe */}
                <motion.div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${proto.requestColor} opacity-30 rounded-full`}
                  animate={{
                    width: phase === 'sending' || phase === 'server-received' || phase === 'processing'
                      ? '100%' : '0%',
                  }}
                  transition={{ duration: 3.2, ease: [0.45, 0.05, 0.55, 0.95] }}
                />
              </div>

              {/* Étiquettes de direction */}
              <div className="flex justify-between mt-2 px-2">
                <motion.span
                  className={`text-[10px] font-800 ${proto.badgeText} opacity-0`}
                  animate={{ opacity: phase === 'sending' ? 1 : 0 }}
                >
                  REQUÊTE →
                </motion.span>
                <motion.span
                  className={`text-[10px] font-800 ${proto.badgeText} opacity-0`}
                  animate={{ opacity: phase === 'returning' ? 1 : 0 }}
                >
                  ← RÉPONSE
                </motion.span>
              </div>

              {/* Badge protocole centré */}
              <div className="flex justify-center -mt-1">
                <span className={`text-[10px] font-700 px-2.5 py-0.5 rounded-full ${proto.badgeBg} ${proto.badgeText} border border-current/20`}>
                  {proto.name}
                </span>
              </div>
            </div>

            {/* ── PAQUET ALLER (requête : ordi → serveur) ── */}
            <motion.div
              animate={reqControls}
              className="absolute z-20"
              style={{ top: '50%', translateY: '-50%', left: '10%', opacity: 0, scale: 0 }}
            >
              <motion.div
                animate={phase === 'sending' ? {
                  y: [0, -5, 0, -3, 0],
                  rotate: [0, -2, 2, -1, 0],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <PacketBox gradient={proto.requestColor} direction="request" />
              </motion.div>
            </motion.div>

            {/* ── PAQUET RETOUR (réponse : serveur → ordi) ── */}
            <motion.div
              animate={resControls}
              className="absolute z-20"
              style={{ top: '50%', translateY: '-50%', left: '78%', opacity: 0, scale: 0 }}
            >
              <motion.div
                animate={phase === 'returning' ? {
                  y: [0, -5, 0, -3, 0],
                  rotate: [0, 2, -2, 1, 0],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <PacketBox gradient={proto.responseColor} direction="response" />
              </motion.div>
            </motion.div>

          </div>{/* fin scène */}

          {/* ── Note contextuelle courte — change selon l'étape active ── */}
          <div className="mt-4 min-h-[40px] px-2">
            <AnimatePresence mode="wait">
              {currentStep >= 0 ? (
                <motion.p
                  key={currentStep}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35 }}
                  className="text-sm text-slate-500 font-500 leading-snug text-center"
                >
                  {proto.steps[currentStep]?.note}
                </motion.p>
              ) : (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-slate-400 font-500 text-center"
                >
                  {phase === 'done'
                    ? '🎉 Échange terminé — la page est chargée !'
                    : 'Appuie sur le bouton pour voir comment ça fonctionne.'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Barre de progression ── */}
        <div className="flex border-t border-slate-100">
          {['Préparation', 'En route', 'Traitement', 'Retour'].map((label, i) => {
            const stepDone  = currentStep > i || phase === 'done'
            const stepActive = currentStep === i
            return (
              <div key={i} className={`
                flex-1 py-2.5 text-center text-[10px] font-700 transition-all duration-500
                ${stepActive
                  ? `${proto.badgeBg} ${proto.badgeText}`
                  : stepDone
                    ? 'bg-slate-50 text-slate-500'
                    : 'text-slate-300'
                }
                ${i < 3 ? 'border-r border-slate-100' : ''}
              `}>
                {stepDone && !stepActive ? '✓ ' : ''}{label}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── BOUTON PRINCIPAL ───────────────────────────────────────────── */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleSend}
          disabled={isRunning}
          className={`btn-primary ${proto.btnClass} text-base px-8 py-4`}
        >
          {isRunning
            ? <><motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >⚙️</motion.span> Animation en cours…</>
            : '🚀 Envoyer le paquet !'
          }
        </button>

        {phase === 'done' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleReset}
            className="btn-primary bg-slate-300 hover:bg-slate-400 text-slate-700"
          >
            🔄 Rejouer
          </motion.button>
        )}
      </div>

      {/* ── TIMELINE DES ÉTAPES ────────────────────────────────────────── */}
      <div className="card mb-6">
        <p className="text-sm font-800 text-slate-400 uppercase tracking-wide mb-4">
          🔬 Ce qui se passe vraiment en coulisses
        </p>
        <div className="space-y-2">
          {proto.steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              isActive={currentStep === i}
              isDone={currentStep > i || phase === 'done'}
              proto={proto}
            />
          ))}
        </div>
      </div>

      {/* ── ENCART FINAL ───────────────────────────────────────────────── */}
      <motion.div
        key={protocol}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          rounded-3xl p-5 border-2 text-sm font-600 leading-relaxed
          ${proto.infoType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : proto.infoType === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-violet-50 border-violet-200 text-violet-800'}
        `}
      >
        {proto.infoText}
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
