/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [ 
      '_includes/**/*.html',
      '_layouts/**/*.html',
      '_posts/*.md',
      'pages/*.html',
      '*.markdown'
  ],
  theme: {
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '6rem',
        '2xl': '8rem',
      },
    },
    extend: {
      scale: {
        '103': '1.03',
      }
    }
  },
  plugins: [],
}