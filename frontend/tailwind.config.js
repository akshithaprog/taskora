/** Colors point at CSS variables (see src/index.css) so light/dark mode needs no extra classes. */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        page: "var(--bg)",
        side: "var(--sidebar)",
        card: "var(--card)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        hover: "var(--hover)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        high: "var(--high)",
        "high-soft": "var(--high-bg)",
        med: "var(--med)",
        "med-soft": "var(--med-bg)",
        low: "var(--low)",
        "low-soft": "var(--low-bg)",
      },
      fontFamily: {
        sans: ["Figtree", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', "Figtree", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(60,48,30,.05), 0 6px 20px -10px rgba(60,48,30,.14)",
        pop: "0 12px 40px -12px rgba(40,30,80,.28), 0 2px 6px rgba(40,30,80,.08)",
      },
    },
  },
  plugins: [],
};
