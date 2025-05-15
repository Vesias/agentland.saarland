/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // These will now reference CSS variables defined in index.css
        // Allows dynamic theming (light/dark/blue) via CSS.
        primary: {
          DEFAULT: 'var(--primary-color)', 
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          light: 'var(--secondary-light)', // Assuming --secondary-light exists or will be added
          dark: 'var(--secondary-dark)',   // Assuming --secondary-dark exists or will be added
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          light: 'var(--accent-light)',   // Assuming --accent-light exists or will be added
          dark: 'var(--accent-dark)',     // Assuming --accent-dark exists or will be added
        },
        background: 'var(--background-color)',
        surface: 'var(--surface-color)',
        foreground: 'var(--text-color)', // Using --text-color for main text
        'foreground-secondary': 'var(--text-secondary-color)',
        'foreground-muted': 'var(--text-muted)',
        border: 'var(--border-color)',

        // Status colors from index.css
        success: 'var(--success-color)',
        warning: 'var(--warning-color)',
        danger: 'var(--danger-color)', // In index.css, dark theme uses --accent-color for danger
        info: 'var(--info-color)',
      },
    },
  },
  plugins: [],
};
