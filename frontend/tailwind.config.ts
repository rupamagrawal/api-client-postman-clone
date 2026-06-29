import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "#1a1a1a",
        panel: "#252525",
        canvas: "#2c2c2c",
        border: "#3a3a3a",
        accent: "#ff6c37",
        "text-primary": "#e0e0e0",
        "text-secondary": "#909090",
        "method-get": "#49cc90",
        "method-post": "#fca130",
        "method-put": "#9b59b6",
        "method-patch": "#50e3c2",
        "method-delete": "#f93e3e",
        "status-success": "#49cc90",
        "status-warning": "#fca130",
        "status-error": "#f93e3e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
