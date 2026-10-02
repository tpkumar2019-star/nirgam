/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flood: {
          dark: '#0b1120',
          card: '#111827',
          panel: '#1e293b',
          border: '#334155',
          accent: '#06b6d4',
          rain: '#38bdf8',
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#f97316',
          severe: '#ef4444',
          critical: '#b91c1c'
        }
      }
    },
  },
  plugins: [],
}
