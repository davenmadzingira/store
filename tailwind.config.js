/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14110F',
          50: '#F5F4F2',
          100: '#E8E5E0',
          200: '#C9C3B8',
          300: '#9D9486',
          400: '#6E665A',
          500: '#4A433A',
          600: '#312B25',
          700: '#221D18',
          800: '#181410',
          900: '#14110F',
        },
        paper: {
          DEFAULT: '#F7F4EC',
          dim: '#EFEADC',
        },
        sand: {
          DEFAULT: '#E4DCC8',
          dark: '#D4C9AC',
        },
        signal: {
          DEFAULT: '#FF5A1F',
          light: '#FF7A45',
          dark: '#D6480F',
        },
        moss: {
          DEFAULT: '#3D4A3A',
          light: '#5A6B55',
          dark: '#2A332A',
        },
        rust: {
          DEFAULT: '#9A3B1F',
          light: '#B85230',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,17,15,0.06)',
        lifted: '0 8px 24px rgba(20,17,15,0.12)',
      },
      animation: {
        ticker: 'ticker 38s linear infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
