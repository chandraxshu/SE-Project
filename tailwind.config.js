/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // IIITA-inspired warm palette
        primary: {
          50:  '#fef7ee',
          100: '#fcecd6',
          200: '#f8d5ac',
          300: '#f3b778',
          400: '#ed9042',
          500: '#e9741e',
          600: '#da5b14',
          700: '#b54313',
          800: '#903617',
          900: '#742f16',
          950: '#3f1509',
        },
        surface: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        accent: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.9rem' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
};
