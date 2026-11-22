/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        india: {
          dark: '#06080c',
          card: 'rgba(15, 20, 28, 0.75)',
          gold: '#d4af37',
          'gold-light': '#f3e5ab',
          'gold-dark': '#9b7a1e',
          amber: '#f59e0b',
          terracotta: '#e26d46',
          emerald: '#10b981',
          crimson: '#e11d48',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        display: ['"Cinzel"', '"Playfair Display"', 'serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
