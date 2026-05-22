/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2d3748',
        },
        pd: {
          bg:      '#0a0a0f',
          surface: '#111118',
          s2:      '#16161f',
          s3:      '#1c1c28',
          b1:      '#222230',
          b2:      '#2a2a3d',
        },
      },
      boxShadow: {
        'glow-violet':    '0 0 20px rgba(124,58,237,0.35)',
        'glow-violet-lg': '0 0 32px rgba(124,58,237,0.5)',
        'glow-violet-sm': '0 0 10px rgba(124,58,237,0.3)',
      },
    },
  },
  plugins: [],
};
