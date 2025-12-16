/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d4fe',
          300: '#a3b8fc',
          400: '#7a92f9',
          500: '#5a6cf4',
          600: '#4349e8',
          700: '#373ad4',
          800: '#2f32ab',
          900: '#2c3186',
          950: '#1a1c4e',
        },
        accent: {
          50: '#fdf4f3',
          100: '#fce8e6',
          200: '#fad4d1',
          300: '#f5b3ae',
          400: '#ed867e',
          500: '#e05a4f',
          600: '#cc3f34',
          700: '#ab3128',
          800: '#8d2c25',
          900: '#752a25',
          950: '#3f120f',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

