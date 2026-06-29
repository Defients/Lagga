import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* CosmoTech™ core palette */
        cosmos: {
          void: '#05020e',
          deep: '#0a0618',
          surface: '#0f0a24',
          raised: '#16103a',
          border: '#251d5a',
          glow: '#3b2fa0',
        },
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff00e5',
          violet: '#a855f7',
          pink: '#ec4899',
          blue: '#3b82f6',
          indigo: '#6366f1',
        },
        accent: {
          primary: '#00f0ff',
          secondary: '#a855f7',
          warm: '#fbbf24',
        },
      },
      fontFamily: {
        cosmo: ['"Exo 2"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'cosmo-sm': '0 0 10px rgba(0, 240, 255, 0.08), 0 0 2px rgba(168, 85, 247, 0.1)',
        'cosmo': '0 0 20px rgba(0, 240, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.4)',
        'cosmo-lg': '0 0 40px rgba(0, 240, 255, 0.15), 0 8px 40px rgba(0, 0, 0, 0.6)',
        'cosmo-glow': '0 0 30px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-magenta': '0 0 15px rgba(255, 0, 229, 0.4)',
      },
      backgroundImage: {
        'cosmo-gradient': 'linear-gradient(135deg, #0a0618 0%, #16103a 30%, #1a0a3e 60%, #0f0a24 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00f0ff, #a855f7, #ec4899)',
      },
      animation: {
        'nebula-drift': 'nebulaDrift 30s ease-in-out infinite',
        'star-twinkle': 'starTwinkle 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'cosmic-spin': 'cosmicSpin 20s linear infinite',
      },
      keyframes: {
        nebulaDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.6' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)', opacity: '0.8' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)', opacity: '0.5' },
        },
        starTwinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        cosmicSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'cosmo': '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;
