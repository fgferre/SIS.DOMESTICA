/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6', // Violet-500
        secondary: '#06b6d4', // Cyan-500
        accent: '#f43f5e', // Rose-500
        success: '#10b981', // Emerald-500
        danger: '#f43f5e', // alias for destructive actions
        'background-light': '#f3f4f6',
        'background-dark': '#050508',
        'surface-dark': '#1a1a2e',
        'glass-border': 'rgba(255, 255, 255, 0.15)',
        'glass-bg': 'rgba(20, 20, 35, 0.7)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(139, 92, 246, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.05) 1px, transparent 1px)',
        scanline:
          'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4))',
        'data-stream':
          'repeating-linear-gradient(45deg, rgba(139, 92, 246, 0.03) 0px, rgba(139, 92, 246, 0.03) 1px, transparent 1px, transparent 10px)',
      },
      boxShadow: {
        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.2)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.5), 0 0 30px rgba(6, 182, 212, 0.2)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.2)',
        'neon-red': '0 0 15px rgba(244, 63, 94, 0.5), 0 0 30px rgba(244, 63, 94, 0.2)',
        'glow-inset': 'inset 0 0 20px rgba(139, 92, 246, 0.1)',
      },
      fontFamily: {
        sans: [
          'Rajdhani',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        display: [
          'Orbitron',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
    },
  },
  plugins: [],
};
