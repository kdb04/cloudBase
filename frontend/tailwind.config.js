/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B5FF5',
          hover: '#4A4EE0',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#FACC15',
          hover: '#EAB308',
          foreground: '#1F2937',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: '#22C55E',
        info: '#3B82F6',
        warning: '#F59E0B',
        dark: {
          bg: '#0F172A',
          surface: '#111827',
          border: '#1F2937',
        }
      },
      maxWidth: {
        'container': '1440px',
        'container-md': '1280px',
      },
      spacing: {
        'desktop': '24px',
        'tablet': '20px',
        'mobile': '16px',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        'DEFAULT': '200ms',
      },
      transitionTimingFunction: {
        'DEFAULT': 'ease-out',
      },
    },
  },
  plugins: [],
}
