/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          deep: '#0B291E',
          forest: '#0F382A',
          emerald: '#124E38',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          gold: '#C98A17',
          amber: '#E5A93C',
        },
        earth: {
          50: '#fbfaf8',
          100: '#f6f4ee',
          200: '#eee8dd',
          300: '#dfd4c3',
          400: '#c8b69f',
          500: '#b4997e',
          600: '#9b7e65',
          700: '#7d6451',
          800: '#675245',
          900: '#54443a',
          950: '#2d231e',
        }
      },
      fontFamily: {
        sinhala: ['"Noto Sans Sinhala"', '"Gemunu Libre"', 'sans-serif'],
        heading: ['"Gemunu Libre"', '"Noto Sans Sinhala"', 'sans-serif'],
        sans: ['"Inter"', '"Noto Sans Sinhala"', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(15, 56, 42, 0.08), 0 4px 12px -2px rgba(15, 56, 42, 0.04)',
        'premium-hover': '0 20px 40px -10px rgba(15, 56, 42, 0.16), 0 8px 16px -4px rgba(15, 56, 42, 0.08)',
        'gold': '0 10px 25px -5px rgba(217, 119, 6, 0.25)',
      },
      backgroundImage: {
        'grain-pattern': "radial-gradient(rgba(217, 119, 6, 0.08) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
