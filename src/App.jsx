/**
 * App.jsx — Composant racine de Web-Décrypté
 * Gère la navigation entre les trois modules pédagogiques.
 */
import { useState } from 'react'
import Navigation from './components/Navigation'
import ProtocolJourney from './components/ProtocolJourney'
import PasswordGrinder from './components/PasswordGrinder'
import DNSExplorer from './components/DNSExplorer'

// ── Pages disponibles ────────────────────────────────────────────────────────
const PAGES = {
  protocols: <ProtocolJourney />,
  passwords: <PasswordGrinder />,
  dns:       <DNSExplorer />,
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('protocols')

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Barre de navigation latérale */}
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Zone de contenu principal */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {PAGES[currentPage]}
      </main>
    </div>
  )
}
