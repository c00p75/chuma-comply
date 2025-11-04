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
        secondary: '#F9F9F9',
        inverse: '#121212',
        'text-primary': '#333333',
        'text-secondary': '#888888',
        'text-inverse': '#FFFFFF',
        'border-primary': '#EAEAEA',
        bg: {
          primary: '#FFFFFF',
          secondary: '#F9F9F9',
          inverse: '#121212',
        },
      },
      spacing: {
        'section': '64px',
        'section-lg': '96px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 4px 12px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
} satisfies Config;


