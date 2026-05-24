/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand
        magenta: {
          50:  '#fdf2f8',
          100: '#f7e3ee',
          200: '#efc4d8',
          300: '#e29ab9',
          400: '#d56094',
          500: '#c8257a', // brand accent (charter)
          DEFAULT: '#c8257a',
          600: '#ad1d68',
          700: '#94154f',
          800: '#6e0e3d',
          900: '#5e0830',
        },
        deepspace: {
          DEFAULT: '#0b0f2a',
          soft:    '#161a3d',
        },
        // Re-anchor the default gray on the charter footer gray (#808080)
        // so existing `text-gray-400` etc. naturally land closer to brand.
      },
      letterSpacing: {
        banner: '0.08em',  // ALL CAPS hero banners
      },
      boxShadow: {
        focus: '0 0 0 2px #fff, 0 0 0 4px #c8257a',
      },
    },
  },
  plugins: [],
};
