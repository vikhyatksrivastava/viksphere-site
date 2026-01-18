/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        accent: '#f97316',
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 6px 18px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
