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
        hospital: {
          navy: '#0B2545',
          navyDark: '#081B33',
          teal: '#00A896',
          tealDark: '#028090',
          blue: '#134074',
          lightBlue: '#EEF4F8',
          accent: '#05668D',
          slate: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        clinical: {
          success: '#10B981',
          successBg: '#ECFDF5',
          warning: '#F59E0B',
          warningBg: '#FFFBEB',
          danger: '#EF4444',
          dangerBg: '#FEF2F2',
          info: '#3B82F6',
          infoBg: '#EFF6FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
