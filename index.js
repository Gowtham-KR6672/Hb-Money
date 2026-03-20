/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFFF7',
          100: '#D9FCEF',
          400: '#0ACF83',
          500: '#00B894',
          700: '#04986C'
        },
        ink: '#0F172A',
        mist: '#E9F3EE',
        slateSoft: '#64748B',
        income: '#10B981',
        expense: '#1D4ED8'
      },
      boxShadow: {
        panel: '0 24px 60px rgba(15, 23, 42, 0.08)',
        soft: '0 10px 30px rgba(10, 207, 131, 0.18)'
      },
      borderRadius: {
        card: '24px'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      backgroundImage: {
        brand: 'linear-gradient(145deg, #0ACF83 0%, #00B894 100%)'
      }
    }
  },
  plugins: []
};
