/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Pure Monochrome Palette
                border: '#000000',
                borderLight: '#E5E5E5',
                input: '#000000',
                ring: '#000000',
                background: '#FFFFFF',
                foreground: '#000000',
                muted: '#F5F5F5',
                mutedForeground: '#525252',
                // Black is the accent
                accent: '#000000',
                accentForeground: '#FFFFFF',
                // Cards
                card: '#FFFFFF',
                cardForeground: '#000000',
                // Keep for component compatibility
                primary: {
                    DEFAULT: '#000000',
                    foreground: '#FFFFFF'
                },
                secondary: {
                    DEFAULT: '#F5F5F5',
                    foreground: '#000000'
                },
                destructive: {
                    DEFAULT: '#000000',
                    foreground: '#FFFFFF'
                },
                popover: {
                    DEFAULT: '#FFFFFF',
                    foreground: '#000000'
                }
            },
            // Zero border radius everywhere
            borderRadius: {
                none: '0px',
                DEFAULT: '0px',
                sm: '0px',
                md: '0px',
                lg: '0px',
                xl: '0px',
                '2xl': '0px',
                '3xl': '0px',
                full: '0px'
            },
            // Serif typography stack
            fontFamily: {
                display: ['"Playfair Display"', 'Georgia', 'serif'],
                serif: ['"Source Serif 4"', 'Georgia', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['"Source Serif 4"', 'Georgia', 'serif'] // Default to serif
            },
            // Dramatic type scale
            fontSize: {
                '9xl': ['10rem', { lineHeight: '1' }],
                '8xl': ['8rem', { lineHeight: '1' }],
                '7xl': ['6rem', { lineHeight: '1' }],
                '6xl': ['4.5rem', { lineHeight: '1' }],
                '5xl': ['3.5rem', { lineHeight: '1' }],
                '4xl': ['2.5rem', { lineHeight: '1.1' }],
                '3xl': ['2rem', { lineHeight: '1.2' }],
                '2xl': ['1.5rem', { lineHeight: '1.3' }],
                'xl': ['1.25rem', { lineHeight: '1.4' }],
                'lg': ['1.125rem', { lineHeight: '1.625' }],
                'base': ['1rem', { lineHeight: '1.625' }],
                'sm': ['0.875rem', { lineHeight: '1.5' }],
                'xs': ['0.75rem', { lineHeight: '1.5' }]
            },
            // Line-based borders
            borderWidth: {
                DEFAULT: '1px',
                0: '0px',
                1: '1px',
                2: '2px',
                4: '4px',
                8: '8px'
            },
            // Typography plugin customization
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '72rem',
                        color: '#000000',
                        lineHeight: '1.625',
                        fontFamily: '"Source Serif 4", Georgia, serif',
                        h1: {
                            fontFamily: '"Playfair Display", Georgia, serif',
                            fontWeight: '700',
                            color: '#000000'
                        },
                        h2: {
                            fontFamily: '"Playfair Display", Georgia, serif',
                            fontWeight: '700',
                            color: '#000000'
                        },
                        h3: {
                            fontFamily: '"Playfair Display", Georgia, serif',
                            fontWeight: '700',
                            color: '#000000'
                        },
                        strong: {
                            color: '#000000',
                            fontWeight: '600'
                        },
                        a: {
                            color: '#000000',
                            textDecoration: 'underline',
                            textDecorationThickness: '1px',
                            textUnderlineOffset: '2px',
                            '&:hover': {
                                textDecorationThickness: '2px'
                            }
                        }
                    }
                }
            }
        }
    },
    plugins: [require('@tailwindcss/typography')]
};
