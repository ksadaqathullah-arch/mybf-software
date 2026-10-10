/**
 * MYBF Brand Design System & Tokens
 * Sourced from official brand guidelines:
 * - Brand Blue: #035AFC (78.5%)
 * - Brand Gold/Yellow: #FBC206 (9.0%)
 * - Brand White: #FBFDFD (8.9%)
 * - Brand Black: #030405 (3.6%)
 */

export const BRAND_TOKENS = {
  colors: {
    primary: {
      DEFAULT: '#035AFC',
      hover: '#0246C7',
      light: '#EBF2FF',
      subtle: '#1A365D',
      foreground: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#FBC206',
      hover: '#E5B005',
      light: '#FEF8E6',
      foreground: '#030405',
    },
    surface: {
      white: '#FBFDFD',
      black: '#030405',
      darkNavy: '#070A10',
      darkCard: '#0E131F',
      darkBorder: '#1A2338',
      lightCard: '#FFFFFF',
      lightBorder: '#E2E8F0',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#035AFC',
    },
  },
  typography: {
    fontSans: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    fontHeading: 'var(--font-heading, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  elevation: {
    sm: '0 1px 2px 0 rgb(3 4 5 / 0.05)',
    card: '0 4px 6px -1px rgb(3 4 5 / 0.08), 0 2px 4px -2px rgb(3 4 5 / 0.05)',
    glow: '0 0 24px -4px rgba(3, 90, 252, 0.25)',
    glowGold: '0 0 24px -4px rgba(251, 194, 6, 0.3)',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
} as const;

export type BrandTokens = typeof BRAND_TOKENS;
