/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          darkest: '#020306',
          bg: '#050810',
          surface: '#080D1A',
          card: '#0C1526',
          elevated: '#111E35',
          border: '#172240',
          muted: '#4A5568',
          cyan: '#00E5FF',
          cyanLight: '#7FFFFC',
          cyanGlow: 'rgba(0, 229, 255, 0.2)',
          emerald: '#00D68F',
          emeraldGlow: 'rgba(0, 214, 143, 0.2)',
          amber: '#FFB800',
          amberGlow: 'rgba(255, 184, 0, 0.2)',
          crimson: '#FF3B5C',
          crimsonGlow: 'rgba(255, 59, 92, 0.2)',
          purple: '#9D4EDD',
          purpleGlow: 'rgba(157, 78, 221, 0.2)',
          pink: '#FF2D78',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'cyber-cyan': '0 0 30px -5px rgba(0, 229, 255, 0.4), 0 0 60px -10px rgba(0, 229, 255, 0.15)',
        'cyber-crimson': '0 0 30px -5px rgba(255, 59, 92, 0.5), 0 0 60px -10px rgba(255, 59, 92, 0.2)',
        'cyber-emerald': '0 0 30px -5px rgba(0, 214, 143, 0.4), 0 0 60px -10px rgba(0, 214, 143, 0.15)',
        'cyber-amber': '0 0 30px -5px rgba(255, 184, 0, 0.4), 0 0 60px -10px rgba(255, 184, 0, 0.15)',
        'cyber-purple': '0 0 30px -5px rgba(157, 78, 221, 0.4), 0 0 60px -10px rgba(157, 78, 221, 0.15)',
        'glow-sm': '0 0 15px -3px rgba(0, 229, 255, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)`,
        'radial-glow': 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.08) 0%, transparent 70%)',
        'hero-gradient': 'linear-gradient(135deg, #020306 0%, #0a0f1e 50%, #020610 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(12,21,38,0.9) 0%, rgba(8,13,26,0.95) 100%)',
        'danger-gradient': 'linear-gradient(135deg, rgba(26,8,14,0.9) 0%, rgba(20,6,10,0.95) 100%)',
        'emerald-gradient': 'linear-gradient(135deg, rgba(0,40,25,0.9) 0%, rgba(0,30,18,0.95) 100%)',
        'shine': 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scan': 'scan 3s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.35s ease-out forwards',
        'border-rotate': 'borderRotate 4s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'data-stream': 'dataStream 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scan: {
          '0%': { top: '0%', opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        borderRotate: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        dataStream: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};
