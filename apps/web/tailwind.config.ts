import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 config for Brazilian Haven Beauty.
 * CSS variables are defined in app/globals.css and referenced here
 * for any tooling (IDE plugins, class generators) that reads the JS config.
 *
 * In Tailwind v4 the primary configuration is done via CSS `@theme` blocks
 * in globals.css, but this file extends the theme for compatibility with
 * tooling that expects a JS config.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          canvas: "var(--color-bg-canvas)",
          warm: "var(--color-bg-warm)",
          soft: "var(--color-bg-soft)",
          elevated: "var(--color-bg-elevated)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          inverse: "var(--color-text-inverse)",
        },
        brand: {
          primary: "var(--color-brand-primary)",
          "primary-hover": "var(--color-brand-primary-hover)",
          support: "var(--color-brand-support)",
          neutral: "var(--color-brand-neutral)",
        },
        accent: {
          soft: "var(--color-accent-soft)",
          warm: "var(--color-accent-warm)",
        },
        border: {
          soft: "var(--color-border-soft)",
          default: "var(--color-border-default)",
          strong: "var(--color-border-strong)",
          inverse: "var(--color-border-inverse)",
        },
        state: {
          success: "var(--color-state-success)",
          warning: "var(--color-state-warning)",
          error: "var(--color-state-error)",
          info: "var(--color-state-info)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        hero: "var(--font-size-hero)",
        h1: "var(--font-size-h1)",
        h2: "var(--font-size-h2)",
        h3: "var(--font-size-h3)",
        h4: "var(--font-size-h4)",
        "body-lg": "var(--font-size-body-lg)",
        body: "var(--font-size-body)",
        small: "var(--font-size-small)",
        micro: "var(--font-size-micro)",
      },
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        panel: "var(--shadow-panel)",
        button: "var(--shadow-button)",
        focus: "var(--shadow-focus)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
        9: "var(--space-9)",
        10: "var(--space-10)",
        11: "var(--space-11)",
        12: "var(--space-12)",
        13: "var(--space-13)",
      },
      maxWidth: {
        container: "var(--layout-container-max)",
        wide: "var(--layout-container-wide)",
        readable: "var(--layout-content-readable)",
      },
      transitionDuration: {
        fast: "var(--motion-duration-fast)",
        base: "var(--motion-duration-base)",
        slow: "var(--motion-duration-slow)",
        reveal: "var(--motion-duration-reveal)",
      },
      transitionTimingFunction: {
        standard: "var(--motion-ease-standard)",
        enter: "var(--motion-ease-enter)",
        exit: "var(--motion-ease-exit)",
      },
    },
  },
  plugins: [],
};

export default config;
