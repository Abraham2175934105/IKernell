/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zinc: {
          50: '#fafafa',
          100: '#f4f5f8',
          200: '#e5e7eb',
          300: '#c8cbd6',
          400: '#9ea3b2',
          500: '#757b8e',
          600: '#525768',
          700: '#383c4a',
          800: '#262934',
          850: '#1e212b',
          900: '#181a22',
          950: '#121318',
        },
        dark: {
          bg: '#121318',
          surface: '#181a22',
          card: '#1e212b',
          border: '#2e3240',
          input: '#15171e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'mesh-float': 'meshFloat 16s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        meshFloat: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(25px, -20px) scale(1.05)' },
          '100%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}


