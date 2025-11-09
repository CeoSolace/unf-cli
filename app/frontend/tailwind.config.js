/**
 * Tailwind CSS configuration for the UnfilteredUK frontend. This file tells
 * Tailwind where to look for class names and extends the default theme.
 */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1e40af'
        },
        secondary: {
          DEFAULT: '#6b7280'
        }
      }
    }
  },
  plugins: []
};