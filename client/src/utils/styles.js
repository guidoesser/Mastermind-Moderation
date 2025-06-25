/**
 * Hilfsfunktionen für Stile ohne Tailwind
 */

// Verbindet CSS-Klassennamen
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Farben
export const colors = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  secondary: '#64748b',
  secondaryDark: '#475569',
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
