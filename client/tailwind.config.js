/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1220',       // Sidebar background
          navylight: '#0F1B2E',  // Sidebar background alternate
          navyactive: '#1A2740', // Sidebar active item highlight fill
          accent: '#D4A574',     // Accent / icons / "MG" logo / links / active border
          accentlight: '#E0B378', // Secondary accent
          primary: '#1E2A4A',    // Primary action buttons deep navy
          primarydark: '#12203D',// Primary action buttons darker
          line: '#3B4A7A',       // Revenue/line chart line
          fill: '#E8EAF6',       // Revenue/line chart fill
        },
        semantic: {
          success: {
            text: '#16A34A',
            bg: '#DCFCE7'
          },
          warning: {
            text: '#D97706',
            bg: '#FEF3C7'
          },
          danger: {
            text: '#DC2626',
            bg: '#FEE2E2'
          },
          info: {
            text: '#2563EB',
            bg: '#DBEAFE'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
