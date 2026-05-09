/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#22C55E',
        background: '#FDFCFB',
        card: '#FFFFFF',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        expense: '#EF4444',
        income: '#22C55E',
      },
      boxShadow: {
        soft: '0 12px 30px -18px rgba(31, 41, 55, 0.45)',
      },
      fontFamily: {
        sans: ['Manrope Variable', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
