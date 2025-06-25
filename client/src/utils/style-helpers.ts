/**
 * Hilfsfunktionen für Styling ohne Tailwind
 */

// Padding-Werte für verschiedene Bildschirmgrößen
export const responsivePadding = {
  base: { paddingLeft: '1rem', paddingRight: '1rem' },
  sm: { paddingLeft: '1.5rem', paddingRight: '1.5rem' },
  lg: { paddingLeft: '2rem', paddingRight: '2rem' },
};

// Bildschirmgrößen
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Farben
export const colors = {
  primary: '#0284c7',
  primaryHover: '#0369a1',
  secondary: '#475569',
  secondaryHover: '#334155',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
};

// Container-Style
export const containerStyle = {
  width: '100%',
  maxWidth: '1280px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1rem',
  paddingRight: '1rem',
};
