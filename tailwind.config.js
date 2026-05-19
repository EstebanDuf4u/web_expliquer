/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Palette personnalisée ──────────────────────────────────────────
      colors: {
        // Bleu réseau (protocoles)
        network: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        // Vert sécurité (mots de passe)
        security: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        // Violet DNS
        dns: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
      },

      // ── Typographie ───────────────────────────────────────────────────
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      // Graisses personnalisées (Nunito supporte 400→900)
      fontWeight: {
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
        '900': '900',
      },

      // ── Animations ────────────────────────────────────────────────────
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
