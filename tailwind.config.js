/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          from: { width: '0', opacity: '0' },
          to: { width: '50px', opacity: '1' },
        },
        scroll: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        slideIn: 'slideIn 1s ease-out forwards',
        'infinite-scroll': 'scroll 25s linear infinite',
      },
    },
  },
  plugins: [],
} 