/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette (existing + refined for modern UI)
        brand: {
          primary: '#352D36',       // Main dark – buttons, active states, text
          'primary-hover': '#3f3441',
          surface: '#F7F6F2',      // Page/section background
          'surface-elevated': '#FFFFFF',
          muted: '#9C9F9F',
          'muted-light': '#909493',
          'muted-soft': '#B5B8B8',
          border: '#E8E9E9',
          'border-focus': '#352D3680',
        },
        // Semantic accents (accessible, works with brand)
        accent: {
          blue: '#4F6BED',
          green: '#0D9488',
          amber: '#D97706',
          red: '#DC2626',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(53, 45, 54, 0.06)',
        'soft-lg': '0 4px 20px rgba(53, 45, 54, 0.08)',
        'soft-xl': '0 8px 32px rgba(53, 45, 54, 0.1)',
        'inner-soft': 'inset 0 1px 2px rgba(53, 45, 54, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      spacing: {
        'sidebar': '16rem',   // 256px expanded
        'sidebar-collapsed': '4.5rem', // 72px collapsed
      },
    },
  },
  plugins: [],
}
