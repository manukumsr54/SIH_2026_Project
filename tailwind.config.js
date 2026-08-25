/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070C15',
        surface: '#0B1423',
        surfaceHighlight: '#121F36',
        border: '#1E2D4A',
        primary: {
          500: '#1a56db',
          600: '#1d4ed8',
        },
        status: {
          critical: '#ef4444', // Red
          high: '#f97316',     // Orange
          medium: '#eab308',   // Yellow
          safe: '#22c55e',     // Green
          info: '#3b82f6',     // Blue
        },
        text: {
          primary: '#ffffff',
          secondary: '#94a3b8',
          tertiary: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
