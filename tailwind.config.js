/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [ 
      '_includes/**/*.html',
      '_layouts/**/*.html',
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
  },
  plugins: [],
}