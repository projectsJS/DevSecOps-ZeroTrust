/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "ink-950": "#07090f",
        "ink-900": "#0f1320",
        "ink-850": "#13182a",
        "ink-800": "#1a2236",
        "ink-700": "#232d45",
        "ink-600": "#2b3a58",
        "cyan-400": "#3fd9ff",
        "teal-400": "#22e0c2",
        "amber-400": "#f4b45f",
        "rose-400": "#f2767a",
        "violet-400": "#9aa3ff"
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["IBM Plex Sans", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(63, 217, 255, 0.18), 0 18px 50px rgba(0, 0, 0, 0.55)",
        card: "0 16px 35px rgba(5, 8, 16, 0.6)"
      },
      backgroundImage: {
        "grid-dark": "linear-gradient(to right, rgba(52, 65, 92, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(52, 65, 92, 0.12) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(circle at top right, rgba(34, 224, 194, 0.18), transparent 50%)"
      }
    }
  },
  plugins: []
};
