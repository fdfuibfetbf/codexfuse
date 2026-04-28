/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#07060c',
          soft: '#0c0a14',
          card: '#0f0d1a',
          panel: '#13101e',
          ring: '#1d1830'
        },
        ink: {
          DEFAULT: '#e8e6f3',
          dim: '#a5a1b8',
          muted: '#6e6982'
        },
        brand: {
          50: '#f1ebff',
          100: '#dccdff',
          200: '#b899ff',
          300: '#9466ff',
          400: '#7a3eff',
          500: '#6420ff',
          600: '#4d12d9',
          700: '#380ca6',
          800: '#260973',
          900: '#170547'
        },
        accent: {
          cyan: '#22d3ee',
          violet: '#8b5cf6',
          fuchsia: '#e879f9',
          lime: '#a3e635'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(138, 92, 246, 0.25), 0 8px 32px -8px rgba(99, 32, 255, 0.45)',
        'glow-cyan': '0 0 0 1px rgba(34, 211, 238, 0.25), 0 8px 32px -8px rgba(34, 211, 238, 0.45)',
        card: '0 1px 0 0 rgba(255,255,255,0.04), 0 12px 40px -12px rgba(0,0,0,0.6)'
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(60% 60% at 50% 0%, rgba(138,92,246,0.18), transparent 60%), radial-gradient(40% 40% at 100% 0%, rgba(34,211,238,0.10), transparent 60%)',
        'mesh':
          'radial-gradient(40% 50% at 20% 20%, rgba(124,58,237,0.35), transparent 70%), radial-gradient(35% 45% at 85% 25%, rgba(34,211,238,0.18), transparent 70%), radial-gradient(45% 55% at 50% 90%, rgba(232,121,249,0.18), transparent 70%)'
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    }
  },
  plugins: []
};
