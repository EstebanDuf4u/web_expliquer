/**
 * Navigation.jsx — Sidebar sombre, typographie forte, pas de blabla générique.
 */
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  {
    id:       'protocols',
    label:    'Protocoles',
    sub:      'HTTP · HTTPS · TCP',
    icon:     '📡',
    accent:   '#60A5FA',   // bleu clair
    bar:      'bg-blue-400',
  },
  {
    id:       'passwords',
    label:    'Mots de Passe',
    sub:      'Hachage & stockage',
    icon:     '🔐',
    accent:   '#34D399',   // vert menthe
    bar:      'bg-emerald-400',
  },
  {
    id:       'dns',
    label:    'DNS',
    sub:      'Annuaire d\'Internet',
    icon:     '🌐',
    accent:   '#A78BFA',   // violet doux
    bar:      'bg-violet-400',
  },
]

export default function Navigation({ currentPage, onNavigate }) {
  return (
    <aside className="w-60 min-h-screen bg-zinc-900 flex flex-col shrink-0">

      {/* ── Logo ───────────────────────────────────────────────── */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          {/* Carré logo — pas de gradient générique */}
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-base shadow">
            🔍
          </div>
          <div>
            <p className="font-900 text-white text-base leading-tight tracking-tight">
              Web-Décrypté
            </p>
            <p className="text-[11px] text-zinc-500 font-500 leading-none mt-0.5">
              comprendre le web
            </p>
          </div>
        </div>
      </div>

      {/* Séparateur */}
      <div className="mx-5 h-px bg-zinc-800 mb-2" />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <p className="text-[10px] font-700 text-zinc-600 uppercase tracking-widest px-3 mb-3">
          Modules
        </p>

        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileTap={{ scale: 0.97 }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                transition-colors duration-150 group relative
                ${active
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-800/60'
                }
              `}
            >
              {/* Barre verticale d'activité */}
              <span className={`
                absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r
                transition-all duration-200
                ${active ? `${item.bar} opacity-100` : 'opacity-0'}
              `} />

              {/* Icône */}
              <span className={`text-lg leading-none transition-opacity ${active ? 'opacity-100' : 'opacity-50 group-hover:opacity-70'}`}>
                {item.icon}
              </span>

              {/* Textes */}
              <div className="min-w-0">
                <p className={`text-sm font-700 leading-tight transition-colors ${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {item.label}
                </p>
                <p className={`text-[11px] font-500 mt-0.5 transition-colors ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {item.sub}
                </p>
              </div>

              {/* Petite pastille couleur quand actif */}
              {active && (
                <motion.span
                  layoutId="dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: item.accent }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* ── Bas de sidebar ─────────────────────────────────────── */}
      <div className="px-5 py-5">
        <p className="text-[11px] text-zinc-700 font-500 leading-relaxed">
          Chaque page web que tu charges déclenche des dizaines d'échanges réseau en quelques millisecondes.
        </p>
      </div>
    </aside>
  )
}
