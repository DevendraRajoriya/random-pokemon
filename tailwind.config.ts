import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // POINTS DIRECTLY TO YOUR ROOT FOLDERS
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBE9BB",
        black: "#0F0F0F",
        charcoal: "#2C2A26",
        marigold: {
          DEFAULT: "#F5BC22",
          hover: "#E0A815",
        },
        indigo: "#2E0D8B",
        brass: "#AC8D39",
        grey: "#A5A5A5",
      },
      fontFamily: {
        // Ensure these match what you load in layout.tsx
        grotesk: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        sans: ["var(--font-space-grotesk)", "sans-serif"], 
      },
    },
  },
  plugins: [],
};

export default config;