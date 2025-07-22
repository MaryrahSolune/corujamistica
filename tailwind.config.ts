
import type { Config } from "tailwindcss";
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        serif: ['Georgia', 'Times New Roman', 'serif'], // Explicit system serifs
        celtic: ['var(--font-celtic)', ...defaultTheme.fontFamily.serif],
      },
  		backgroundImage: {
        'shiva-hero-bg': "url('/img/shiva.jpg')",
        'sacred-geometry-pattern': "url('/img/sacred_geometry_pattern.png')",
      },
      colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'subtle-pulse': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'pulse_slow': { 
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.25', transform: 'scale(1.05)' },
        },
        'animate-background-pan': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        'subtle-glow': {
          '0%, 100%': { opacity: '0.5', filter: 'drop-shadow(0 0 5px currentColor) drop-shadow(0 0 2px currentColor)' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 12px currentColor) drop-shadow(0 0 5px currentColor)' },
        },
        'float-up-and-fade': {
          '0%': { opacity: '1', transform: 'translateY(0px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(0.8)' },
        },
        'icon-color-flow': {
          '0%, 100%': { color: 'hsl(var(--primary))' },
          '33%': { color: 'hsl(var(--accent))' },
          '66%': { color: 'hsl(var(--secondary))' },
        },
        'text-gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'float-quad': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-5px, -5px)' },
          '50%': { transform: 'translate(5px, -5px)' },
          '75%': { transform: 'translate(-5px, 5px)' },
        },
        'fall-and-fade': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px) rotate(0deg) scale(0.8)',
          },
          '20%': {
            opacity: '0.8',
          },
          '80%': {
            opacity: '0.8',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(20px) rotate(70deg) scale(1)',
          },
        },
        'gentle-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fall-and-fade-petal': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px) rotate(0deg)',
          },
          '10%': {
            opacity: '1',
          },
          '90%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(120vh) rotate(360deg)',
          },
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-in',
        'slide-in-up': 'slide-in-up 0.5s ease-out',
        'subtle-pulse': 'subtle-pulse 2s ease-in-out infinite',
        'pulse_slow': 'pulse_slow 6s infinite ease-in-out',
        'background-pan': 'animate-background-pan 15s linear infinite alternate',
        'subtle-glow': 'subtle-glow 3.5s ease-in-out infinite',
        'float-up': 'float-up-and-fade 1.5s ease-out forwards',
        'icon-flow': 'icon-color-flow 4s linear infinite',
        'text-gradient-flow': 'text-gradient-flow 4s ease infinite',
        'float-quad': 'float-quad 30s linear infinite alternate',
        'leaf-fade': 'fade-in-out-leaf 8s ease-in-out infinite',
        'fall-and-fade': 'fall-and-fade linear infinite',
        'gentle-rotate': 'gentle-rotate 5s ease-out',
        'fall-and-fade-petal': 'fall-and-fade-petal linear infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

    