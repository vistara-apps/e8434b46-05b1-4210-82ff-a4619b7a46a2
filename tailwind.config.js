/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220, 100%, 50%)',
        accent: 'hsl(160, 100%, 45%)',
        bg: 'hsl(230, 15%, 95%)',
        surface: 'hsl(0, 0%, 100%)',
        textPrimary: 'hsl(220, 15%, 15%)',
        textSecondary: 'hsl(220, 15%, 35%)',
        positive: 'hsl(110, 100%, 40%)',
        negative: 'hsl(0, 100%, 50%)',
        dark: {
          bg: 'hsl(220, 15%, 8%)',
          surface: 'hsl(220, 15%, 12%)',
          card: 'hsl(220, 15%, 16%)',
          border: 'hsl(220, 15%, 20%)',
          text: 'hsl(220, 15%, 85%)',
          textSecondary: 'hsl(220, 15%, 65%)',
        }
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(220, 15%, 15%, 0.08)',
        'dark-card': '0 4px 12px hsla(0, 0%, 0%, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
