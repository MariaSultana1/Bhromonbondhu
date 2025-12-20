/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#e2e6f7',
          100: '#c3dff9',
          500: '#94eef6',
          600: '#045a61',
        },
        'secondary': {
          50: '#f6fffd',
          100: '#dcecfb',
          500: '#04a0ae',
          600: '#055a62',
        },
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'serif': ['serif'],
      },
    },
  },
  plugins: [],
}