module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100:'#e0e7ff',
          200:'#c7d2fe',
          300:'#a5b4fc',
          400:'#818cf8',
          500:'#6366f1',
          600:'#4f46e5',
          700:'#4338ca',
          800:'#3730a3',
          900:'#312e81'
        },
        success: {500: '#16a34a'},
        danger:  {500: '#ef4444'},
        warning: {500: '#f59e0b'},
        muted:   {500: '#6b7280'}
      },
      borderRadius: {
        'xl': '1rem'
      },
      boxShadow: {
        'card': '0 6px 18px rgba(15, 23, 42, 0.06)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};
