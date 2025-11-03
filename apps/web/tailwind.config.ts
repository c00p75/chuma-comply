import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#F7F7F9',
        inverse: '#121212',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B6B6B',
        'text-inverse': '#FFFFFF',
        'border-primary': '#E0E0E0',
      },
      spacing: {
        'section': '64px',
        'section-lg': '96px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;


