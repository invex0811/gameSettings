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
          bg:      '#08090f',
          surface: '#10121b',
          s2:      '#151824',
          s3:      '#1c2130',
          b1:      '#252b3a',
          b2:      '#31394d',
          ink:     '#f8fafc',
          muted:   '#94a3b8',
          cyan:    '#22d3ee',
        },
      },
      boxShadow: {
        'glow-violet':    '0 0 20px rgba(124,58,237,0.35)',
        'glow-violet-lg': '0 0 32px rgba(124,58,237,0.5)',
        'glow-violet-sm': '0 0 10px rgba(124,58,237,0.3)',
        'panel': '0 18px 60px rgba(0,0,0,0.34)',
        'panel-soft': '0 12px 34px rgba(0,0,0,0.24)',
      },
    },
  },
  plugins: [],
};
