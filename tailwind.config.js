/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0d12',
          secondary: '#0f1419',
          tertiary: '#141c24',
          panel: '#111820',
        },
        accent: {
          green: '#00c88c',
          blue: '#00a8f0',
          warn: '#f0a800',
          danger: '#e04040',
        },
        border: {
          DEFAULT: 'rgba(0,200,140,0.18)',
        },
        text: {
          primary: '#c8d8e8',
          secondary: '#7090a8',
        },
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        sans: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
