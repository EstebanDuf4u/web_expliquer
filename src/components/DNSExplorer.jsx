/**
 * DNSExplorer.jsx — Module "Le DNS, l'Annuaire d'Internet"
 *
 * L'utilisateur entre un nom de domaine et voit étape par étape
 * comment le DNS traduit "google.com" en adresse IP.
 *
 * Analogie : le DNS, c'est l'annuaire téléphonique d'Internet.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Données des étapes DNS ───────────────────────────────────────────────────
function buildSteps(domain) {
  const ext = domain.split('.').pop() || 'com'
  return [
    {
      id:      'browser',
      emoji:   '💻',
      actor:   'Ton Navigateur',
      color:   'network',
      action:  `"Hm, c'est quoi l'adresse de ${domain} ?"`,
      detail:  'Ton navigateur ne connaît pas encore l\'adresse IP. Il consulte d\'abord son cache local.',
      result:  'Cache vide → je demande au Résolveur DNS',
    },
    {
      id:      'resolver',
      emoji:   '🔍',
      actor:   'Résolveur DNS',
      color:   'network',
      action:  `"Je cherche ${domain} dans mon cache..."`,
      detail:  'Le Résolveur DNS (fourni par ton FAI ou Google 8.8.8.8) cherche s\'il connaît déjà la réponse.',
      result:  'Pas en cache → je remonte la chaîne !',
    },
    {
      id:      'root',
      emoji:   '🌍',
      actor:   'Serveur Racine',
      color:   'dns',
      action:  `"${domain} ? Je ne connais pas, mais le serveur .${ext} sait !"`,
      detail:  'Il existe 13 serveurs racines dans le monde. Ils connaissent les serveurs responsables de chaque extension (.com, .fr, .org...)',
      result:  `→ Va voir le serveur TLD ".${ext}"`,
    },
    {
      id:      'tld',
      emoji:   '📂',
      actor:   `Serveur TLD (.${ext})`,
      color:   'dns',
      action:  `"Je gère tous les .${ext}. Pour ${domain}, c'est ce serveur autoritaire !"`,
      detail:  `Le serveur TLD (Top Level Domain) gère toutes les adresses en ".${ext}". Il pointe vers le serveur officiel du domaine.`,
      result:  `→ Serveur autoritaire de ${domain} trouvé !`,
    },
    {
      id:      'auth',
      emoji:   '📖',
      actor:   'Serveur Autoritaire',
      color:   'security',
      action:  `"Oui ! ${domain} = 142.250.74.110 !"`,
      detail:  `C'est le serveur officiel qui possède les vraies informations de ${domain}. Il renvoie l'adresse IP exacte.`,
      result:  `✅ IP trouvée : 142.250.74.110`,
    },
    {
      id:      'connect',
      emoji:   '🎯',
      actor:   'Ton Navigateur',
      color:   'security',
      action:  `"Parfait ! Je me connecte à 142.250.74.110 !"`,
      detail:  'Ton navigateur utilise maintenant l\'adresse IP pour se connecter directement au serveur et charger la page.',
      result:  `🌐 Page chargée avec succès !`,
    },
  ]
}

// ── Suggestions de domaines ──────────────────────────────────────────────────
const SUGGESTIONS = ['google.com', 'youtube.com', 'wikipedia.org', 'github.com', 'netflix.com']

// ── Composant d'étape DNS ────────────────────────────────────────────────────
function DNSStep({ step, index, isActive, isDone, isVisible }) {
  const colorMap = {
    network:  { bg: 'bg-network-50',  border: 'border-network-200',  text: 'text-network-700',  dot: 'bg-network-500',  ring: 'ring-network-200'  },
    dns:      { bg: 'bg-dns-50',      border: 'border-dns-200',      text: 'text-dns-700',      dot: 'bg-dns-500',      ring: 'ring-dns-200'      },
    security: { bg: 'bg-security-50', border: 'border-security-200', text: 'text-security-700', dot: 'bg-security-500', ring: 'ring-security-200' },
  }
  const c = colorMap[step.color] || colorMap.network

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className={`
        flex gap-4 p-4 rounded-2xl border-2 transition-all duration-300
        ${isActive
          ? `${c.bg} ${c.border} shadow-sm ring-4 ${c.ring}`
          : isDone
            ? 'bg-slate-50 border-slate-200'
            : 'bg-white border-slate-100 opacity-50'
        }
      `}>
        {/* Icône numérotée */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-xl
            ${isActive ? `${c.dot} ring-4 ${c.ring}` : isDone ? 'bg-slate-200' : 'bg-slate-100'}
          `}>
            {isDone ? '✓' : step.emoji}
          </div>
          {/* Ligne connectrice */}
          {index < 5 && (
            <div className={`w-0.5 flex-1 min-h-[16px] rounded-full transition-colors duration-500
              ${isDone ? c.dot.replace('bg-', 'bg-') : 'bg-slate-200'}`}
            />
          )}
        </div>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-800 text-sm ${isActive ? c.text : isDone ? 'text-slate-600' : 'text-slate-400'}`}>
              {step.actor}
            </p>
            {isActive && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}
              >
                En cours...
              </motion.span>
            )}
          </div>

          <p className={`text-sm font-600 mb-1 ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>
            {step.action}
          </p>

          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <p className="text-xs text-slate-500 font-500 leading-relaxed bg-white rounded-xl p-3 border border-slate-100">
                  {step.detail}
                </p>
                <p className={`text-xs font-700 ${c.text}`}>
                  {step.result}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {isDone && !isActive && (
            <p className={`text-xs font-700 ${c.text}`}>{step.result}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function DNSExplorer() {
  const [domain,       setDomain]       = useState('')
  const [currentStep,  setCurrentStep]  = useState(-1)
  const [phase,        setPhase]        = useState('idle')   // idle | running | done
  const [steps,        setSteps]        = useState([])
  const [visibleSteps, setVisibleSteps] = useState([])

  const isRunning = phase === 'running'

  // ── Démarrer la résolution DNS ────────────────────────────────────────────
  async function handleResolve() {
    if (!domain.trim() || isRunning) return

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
    const dnsSteps = buildSteps(cleanDomain)

    setSteps(dnsSteps)
    setVisibleSteps([])
    setCurrentStep(-1)
    setPhase('running')

    for (let i = 0; i < dnsSteps.length; i++) {
      // Révèle l'étape
      setVisibleSteps(prev => [...prev, i])
      setCurrentStep(i)
      await delay(i === 0 ? 400 : 1600)
    }

    setCurrentStep(-1)
    setPhase('done')
  }

  function handleReset() {
    setDomain('')
    setPhase('idle')
    setCurrentStep(-1)
    setSteps([])
    setVisibleSteps([])
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* ── En-tête ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-700 mb-3 bg-dns-50 text-dns-700">
          🌐 Module 3
        </div>
        <h2 className="text-3xl font-900 text-slate-800 mb-2">
          Le DNS, l'Annuaire d'Internet
        </h2>
        <p className="text-slate-500 font-500 text-lg">
          Comment ton navigateur trouve-t-il l'adresse d'un site ? C'est le DNS — le grand annuaire d'Internet.
        </p>
      </div>

      {/* ── Analogie visuelle ── */}
      <div className="card mb-6 bg-gradient-to-br from-dns-50 to-white border-dns-100">
        <div className="flex items-center gap-4">
          <div className="text-4xl">📞</div>
          <div>
            <p className="font-800 text-slate-700 mb-1">L'analogie du bottin téléphonique</p>
            <p className="text-sm text-slate-500 font-500 leading-relaxed">
              Tu connais le nom "Google" mais pas son numéro de téléphone (son adresse IP).
              Le DNS, c'est l'annuaire : il traduit <strong className="text-dns-700">"google.com"</strong> en
              <strong className="text-dns-700"> "142.250.74.110"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Entrée domaine ── */}
      <div className="card mb-6">
        <label className="block text-sm font-800 text-slate-600 mb-3">
          🌐 Entre un nom de domaine à résoudre :
        </label>
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleResolve()}
            disabled={isRunning}
            placeholder="ex : google.com, youtube.com..."
            className={`
              flex-1 px-4 py-3 rounded-2xl border-2 font-600 text-slate-700
              outline-none transition-all duration-200
              placeholder:text-slate-300 placeholder:font-500
              ${isRunning
                ? 'border-dns-200 bg-dns-50 cursor-not-allowed'
                : 'border-slate-200 focus:border-dns-400 focus:ring-4 focus:ring-dns-100'
              }
            `}
          />
          <button
            onClick={handleResolve}
            disabled={!domain.trim() || isRunning}
            className="btn-primary bg-dns-500 hover:bg-dns-600"
          >
            {isRunning
              ? <><span className="animate-spin inline-block">🔍</span> Résolution...</>
              : '🔍 Résoudre !'
            }
          </button>
        </div>

        {/* Suggestions rapides */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-700 text-slate-400 self-center">Essaie :</span>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => !isRunning && setDomain(s)}
              disabled={isRunning}
              className="text-xs font-700 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500
                         hover:bg-dns-50 hover:text-dns-700 transition-colors duration-150
                         disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200
                         hover:border-dns-200"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Visualisation des étapes DNS ── */}
      <AnimatePresence>
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-800 text-slate-500">
                🗺️ Voyage de la requête DNS pour{' '}
                <span className="text-dns-700 font-900">{domain}</span> :
              </p>
              {phase === 'done' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-700 text-security-700 bg-security-50 border border-security-200 px-3 py-1 rounded-full"
                >
                  ✅ Résolu !
                </motion.span>
              )}
            </div>

            <div className="space-y-2">
              {steps.map((step, i) => (
                <DNSStep
                  key={step.id}
                  step={step}
                  index={i}
                  isActive={currentStep === i}
                  isDone={phase === 'done' || (currentStep > i)}
                  isVisible={visibleSteps.includes(i)}
                />
              ))}
            </div>

            {/* Résultat final */}
            <AnimatePresence>
              {phase === 'done' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 bg-security-500 rounded-2xl p-5 text-white text-center shadow-lg"
                >
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="font-900 text-lg">DNS résolu !</p>
                  <p className="font-600 text-security-100 text-sm mt-1">
                    <span className="text-white font-800">{domain}</span> →{' '}
                    <span className="font-mono font-800 bg-white/20 px-2 py-0.5 rounded-lg">
                      142.250.74.110
                    </span>
                  </p>
                  <p className="text-xs text-security-200 mt-2 font-500">
                    Tout ça en moins de 50 millisecondes dans la réalité !
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton reset */}
      {phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <button onClick={handleReset} className="btn-primary bg-slate-400 hover:bg-slate-500">
            🔄 Essayer un autre domaine
          </button>
        </motion.div>
      )}

      {/* ── Concepts clés ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dns-50 border border-dns-200 rounded-2xl p-4">
          <p className="font-800 text-dns-800 mb-2">📦 C'est quoi une adresse IP ?</p>
          <p className="text-sm text-dns-700 font-500 leading-relaxed">
            Chaque machine sur Internet possède une adresse unique (ex: <span className="font-mono font-700">192.168.1.1</span>).
            C'est comme un numéro de maison. Le DNS traduit les noms mémorisables en ces numéros.
          </p>
        </div>
        <div className="bg-network-50 border border-network-200 rounded-2xl p-4">
          <p className="font-800 text-network-800 mb-2">⚡ Et si je change de DNS ?</p>
          <p className="text-sm text-network-700 font-500 leading-relaxed">
            Tu peux utiliser des DNS alternatifs comme <span className="font-mono font-700">8.8.8.8</span> (Google) ou
            <span className="font-mono font-700"> 1.1.1.1</span> (Cloudflare). Certains sont plus rapides ou plus sécurisés !
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Utilitaire ───────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
