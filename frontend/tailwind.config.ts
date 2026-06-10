import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#111114', // primary text + solid buttons
          muted: '#52525b', // secondary text
          faint: '#a1a1aa', // tertiary / placeholders
        },
        page: '#f4f4f5', // app background
        card: '#ffffff', // surfaces
        line: {
          DEFAULT: '#e4e4e7', // hairline borders / dividers
          strong: '#18181b', // emphasis borders (nav, selected, wallet)
        },
        accent: {
          DEFAULT: '#e11d48', // sparse brand accent (logo, highlights)
          soft: '#fff1f2',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 17, 20, 0.04)',
        lift: '0 8px 28px rgba(17, 17, 20, 0.12)',
      },
      letterSpacing: {
        label: '0.08em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
