/**
 * PasswordGrinder.jsx — Module "La Moulinette" (Hachage de mots de passe)
 *
 * L'utilisateur tape un mot de passe, clique sur "Hacher !",
 * voit une animation de broyage (moulinette), puis obtient
 * le vrai hash SHA-256 calculé via Web Crypto API.
 *
 * Concepts expliqués : hachage unidirectionnel, déterminisme,
 * résistance aux collisions.
 */
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Calcul SHA-256 réel via Web Crypto API ───────────────────────────────────
async function computeSHA256(text) {
  const encoder = new TextEncoder()
  const data     = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray  = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Engrenage SVG animé ──────────────────────────────────────────────────────
function Gear({ size = 60, isSpinning, reverse = false, color = '#10B981' }) {
  const teeth = 8
  const r = size / 2 - 4
  const toothH = 8
  const toothW = 0.35

  // Génère le chemin SVG d'un engrenage avec dents
  function gearPath(cx, cy, innerR, outerR, numTeeth) {
    const pts = []
    for (let i = 0; i < numTeeth * 2; i++) {
      const angle = (i * Math.PI) / numTeeth
      const isOuter = i % 2 === 0
      const rad = isOuter ? outerR : innerR
      const spread = isOuter ? toothW : 0
      pts.push([
        cx + Math.cos(angle - spread) * rad,
        cy + Math.sin(angle - spread) * rad,
      ])
      if (isOuter) {
        pts.push([
          cx + Math.cos(angle + spread) * rad,
          cy + Math.sin(angle + spread) * rad,
        ])
      }
    }
    return 'M ' + pts.map(p => p.join(',')).join(' L ') + ' Z'
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      animate={{ rotate: isSpinning ? (reverse ? -360 : 360) : 0 }}
      transition={{
        duration:   1.5,
        repeat:     isSpinning ? Infinity : 0,
        ease:       'linear',
      }}
    >
      {/* Corps de l'engrenage */}
      <path
        d={gearPath(size / 2, size / 2, r - toothH, r, teeth)}
        fill={color}
        opacity={0.9}
      />
      {/* Cercle central */}
      <circle cx={size / 2} cy={size / 2} r={r * 0.38} fill="white" opacity={0.95} />
      <circle cx={size / 2} cy={size / 2} r={r * 0.18} fill={color} opacity={0.6} />
    </motion.svg>
  )
}

// ── Caractère broyé (effet visuel) ──────────────────────────────────────────
function CrunchingChar({ char, delay: d }) {
  return (
    <motion.span
      className="inline-block font-mono font-700 text-lg text-security-600"
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: 30, opacity: 0, scale: 0.3, rotate: Math.random() * 30 - 15 }}
      transition={{ duration: 0.6, delay: d, ease: 'easeIn' }}
    >
      {char}
    </motion.span>
  )
}

// ── Carte de concept pédagogique ─────────────────────────────────────────────
function ConceptCard({ emoji, title, text, color = 'security' }) {
  const colors = {
    security: 'bg-security-50 border-security-200 text-security-800',
    warning:  'bg-amber-50 border-amber-200 text-amber-800',
    info:     'bg-network-50 border-network-200 text-network-800',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{emoji}</span>
        <div>
          <p className="font-800 text-sm mb-1">{title}</p>
          <p className="text-xs font-500 opacity-80 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function PasswordGrinder() {
  const [password,     setPassword]     = useState('')
  const [hash,         setHash]         = useState('')
  const [prevHash,     setPrevHash]     = useState('')
  const [phase,        setPhase]        = useState('idle')  // idle | grinding | done
  const [isCrunching,  setIsCrunching]  = useState(false)
  const [storedInDB,   setStoredInDB]   = useState(false)
  const [hashChars,    setHashChars]    = useState([])
  const [showChars,    setShowChars]    = useState([])
  const inputRef = useRef(null)

  const isGrinding = phase === 'grinding'

  // ── Lance le hachage ─────────────────────────────────────────────────────
  async function handleGrind() {
    if (!password.trim() || isGrinding) return

    setPrevHash(hash)
    setHash('')
    setStoredInDB(false)
    setHashChars([])
    setShowChars([])
    setPhase('grinding')
    setIsCrunching(true)

    // Animation de broyage (~1.5 s)
    await delay(1500)
    setIsCrunching(false)

    // Calcul du vrai SHA-256
    const result = await computeSHA256(password)
    setHash(result)

    // Révèle le hash caractère par caractère
    const chars = result.split('')
    for (let i = 0; i <= chars.length; i++) {
      setShowChars(chars.slice(0, i))
      await delay(18)
    }

    setHashChars(chars)
    setPhase('done')

    await delay(800)
    setStoredInDB(true)
  }

  function handleReset() {
    setPassword('')
    setHash('')
    setPrevHash('')
    setPhase('idle')
    setStoredInDB(false)
    setHashChars([])
    setShowChars([])
    inputRef.current?.focus()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* ── En-tête ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-700 mb-3 bg-security-50 text-security-700">
          🔐 Module 2
        </div>
        <h2 className="text-3xl font-900 text-slate-800 mb-2">
          La Moulinette à Mots de Passe
        </h2>
        <p className="text-slate-500 font-500 text-lg">
          Ton mot de passe n'est jamais stocké tel quel. Il passe dans une "moulinette" qui le transforme en code secret.
        </p>
      </div>

      {/* ── Zone principale ── */}
      <div className="card mb-6">
        <div className="flex flex-col gap-8">

          {/* ── Entrée mot de passe ── */}
          <div>
            <label className="block text-sm font-800 text-slate-600 mb-2">
              ✏️ Tape un mot de passe (ex : "chat123", "soleil") :
            </label>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGrind()}
                disabled={isGrinding}
                placeholder="Entre ton mot de passe ici..."
                className={`
                  flex-1 px-4 py-3 rounded-2xl border-2 font-600 text-slate-700
                  outline-none transition-all duration-200
                  placeholder:text-slate-300 placeholder:font-500
                  ${isGrinding
                    ? 'border-security-200 bg-security-50 cursor-not-allowed'
                    : 'border-slate-200 focus:border-security-400 focus:ring-4 focus:ring-security-100'
                  }
                `}
              />
              <button
                onClick={handleGrind}
                disabled={!password.trim() || isGrinding}
                className="btn-primary bg-security-500 hover:bg-security-600"
              >
                {isGrinding
                  ? <><span className="animate-spin inline-block">⚙️</span> Broyage...</>
                  : '⚡ Hacher !'
                }
              </button>
            </div>
          </div>

          {/* ── Visualisation de la moulinette ── */}
          <div className="relative flex items-center justify-center gap-8 py-6 bg-gradient-to-b from-security-50 to-white rounded-3xl border border-security-100 overflow-hidden">

            {/* Texte entrant dans la moulinette */}
            <div className="flex flex-col items-center gap-3 min-w-[120px]">
              <div className="text-center">
                <p className="text-xs font-800 text-slate-400 mb-2 uppercase tracking-wide">Entrée</p>
                <div className="min-h-[40px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isCrunching ? (
                      <motion.div key="crunching" className="flex gap-0.5 flex-wrap justify-center max-w-[120px]">
                        {password.split('').map((ch, i) => (
                          <CrunchingChar key={i} char={ch} delay={i * 0.07} />
                        ))}
                      </motion.div>
                    ) : password && phase === 'idle' ? (
                      <motion.div key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="font-mono font-700 text-slate-600 text-lg bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        {password}
                      </motion.div>
                    ) : phase !== 'idle' ? (
                      <motion.div key="consumed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-2xl">✓</motion.div>
                    ) : (
                      <p key="empty" className="text-slate-300 text-sm font-500">ton texte ici</p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Flèche d'entrée */}
              <motion.div
                className="text-2xl text-security-400"
                animate={{ x: isGrinding ? [0, 6, 0] : 0 }}
                transition={{ duration: 0.4, repeat: isGrinding ? Infinity : 0 }}
              >
                →
              </motion.div>
            </div>

            {/* ── La Moulinette (engrenages) ── */}
            <div className="relative flex flex-col items-center gap-1">
              <p className="text-xs font-800 text-slate-500 uppercase tracking-wide mb-2">
                SHA-256
              </p>
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Engrenage principal (grand) */}
                <div className="absolute">
                  <Gear size={72} isSpinning={isGrinding} color="#10B981" />
                </div>
                {/* Engrenage secondaire (petit, en haut à droite) */}
                <div className="absolute -top-3 -right-3">
                  <Gear size={40} isSpinning={isGrinding} reverse color="#059669" />
                </div>
                {/* Engrenage tertiaire (petit, en bas à gauche) */}
                <div className="absolute -bottom-2 -left-2">
                  <Gear size={36} isSpinning={isGrinding} reverse color="#34D399" />
                </div>

                {/* Label au centre */}
                <motion.div
                  className="absolute z-10 text-center pointer-events-none"
                  animate={{ opacity: isGrinding ? [1, 0.5, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: isGrinding ? Infinity : 0 }}
                >
                  <p className="text-[10px] font-800 text-white drop-shadow">
                    {isGrinding ? '🔥' : '⚙️'}
                  </p>
                </motion.div>
              </div>

              {/* Étiquette */}
              <span className="text-[10px] font-700 text-security-600 bg-security-50 px-2 py-0.5 rounded-full border border-security-200 mt-1">
                Fonction de hachage
              </span>
            </div>

            {/* Flèche de sortie */}
            <motion.div
              className="text-2xl text-security-400"
              animate={{ x: isGrinding ? [0, 6, 0] : 0 }}
              transition={{ duration: 0.4, repeat: isGrinding ? Infinity : 0 }}
            >
              →
            </motion.div>

            {/* ── Résultat haché ── */}
            <div className="flex flex-col items-center gap-2 min-w-[140px]">
              <p className="text-xs font-800 text-slate-400 uppercase tracking-wide mb-2">
                Hash SHA-256
              </p>
              <div className="min-h-[60px] flex items-center">
                <AnimatePresence mode="wait">
                  {showChars.length > 0 ? (
                    <motion.div
                      key="hash"
                      className="font-mono text-[11px] font-700 text-security-700 bg-security-50
                                 border border-security-200 rounded-xl p-2 break-all max-w-[160px]
                                 leading-relaxed shadow-sm"
                    >
                      {showChars.join('')}
                      {showChars.length < 64 && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-1.5 h-3 bg-security-500 ml-0.5 rounded-sm"
                        />
                      )}
                    </motion.div>
                  ) : (
                    <p key="empty" className="text-slate-300 text-sm font-500 text-center">
                      résultat ici
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Stockage dans la "Base de Données" (serveur) ── */}
          <AnimatePresence>
            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-800 rounded-3xl p-5 border border-slate-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-security-500 flex items-center justify-center text-lg">
                    🗄️
                  </div>
                  <div>
                    <p className="font-800 text-white text-sm">Base de données du serveur</p>
                    <p className="text-xs text-slate-400 font-500">Ce que le serveur stocke réellement :</p>
                  </div>
                  <AnimatePresence>
                    {storedInDB && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-xs font-700 text-security-400 bg-security-900/30
                                   border border-security-700 px-2 py-0.5 rounded-full"
                      >
                        ✓ Enregistré
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs leading-relaxed">
                  <span className="text-slate-500">utilisateur: </span>
                  <span className="text-amber-300">"toi"</span>
                  <span className="text-slate-500">,   </span>
                  <br />
                  <span className="text-slate-500">mot_de_passe: </span>
                  <span className="text-slate-500 line-through">{password}</span>
                  <span className="text-slate-500"> ← jamais stocké !</span>
                  <br />
                  <span className="text-slate-500">hash: </span>
                  <AnimatePresence>
                    {storedInDB && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-security-400 break-all"
                      >
                        "{hash}"
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparaison entre deux hash */}
          <AnimatePresence>
            {prevHash && hash && prevHash !== hash && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
              >
                <p className="text-sm font-800 text-amber-800 mb-2">
                  🔍 Compare les deux hash :
                </p>
                <div className="space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-amber-600 font-700">Hash précédent :</span>
                    <span className="text-amber-700 ml-2 break-all">{prevHash.slice(0, 32)}...</span>
                  </div>
                  <div>
                    <span className="text-security-600 font-700">Hash actuel :</span>
                    <span className="text-security-700 ml-2 break-all">{hash.slice(0, 32)}...</span>
                  </div>
                </div>
                <p className="text-xs text-amber-700 font-600 mt-2">
                  ✨ Un seul caractère différent → hash complètement différent !
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton reset */}
          {phase === 'done' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <button onClick={handleReset} className="btn-primary bg-slate-400 hover:bg-slate-500">
                🔄 Essayer un autre mot de passe
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Concepts pédagogiques ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConceptCard
          emoji="🔀"
          title="Unidirectionnel"
          text="Impossible de retrouver le mot de passe depuis le hash. C'est une rue à sens unique !"
          color="security"
        />
        <ConceptCard
          emoji="🎯"
          title="Déterministe"
          text="Le même mot de passe donne toujours le même hash. Jamais de hasard !"
          color="info"
        />
        <ConceptCard
          emoji="❄️"
          title="Effet Avalanche"
          text="Changer une seule lettre transforme complètement le hash résultant."
          color="warning"
        />
      </div>
    </div>
  )
}

// ── Utilitaire ───────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
