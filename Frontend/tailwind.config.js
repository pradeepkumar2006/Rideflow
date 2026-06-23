/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        card: '#FAFAFA',
        'card-foreground': '#000000',
        border: '#E5E5E5',
        primary: '#000000',
        'primary-foreground': '#FFFFFF',
        secondary: '#F5F5F5',
        'secondary-foreground': '#171717',
        muted: '#F5F5F5',
        'muted-foreground': '#737373',
        accent: '#171717',
        'accent-foreground': '#FFFFFF',
        destructive: '#ef4444',
        'destructive-foreground': '#FFFFFF',
        success: '#22c55e',
        warning: '#eab308'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
