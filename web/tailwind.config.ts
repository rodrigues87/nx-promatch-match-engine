import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme palette
        surface: {
          50: "#f8fafc",
          100: "#1e2024",
          200: "#25272c",
          300: "#2c2f35",
          400: "#353840",
          500: "#3d414a",
          600: "#4a4f5a",
          700: "#5a6070",
          800: "#8b93a5",
          900: "#c4cbdb",
        },
        accent: {
          DEFAULT: "#f97316", // Orange (like reference)
          light: "#fb923c",
          dark: "#ea580c",
          glow: "rgba(249, 115, 22, 0.15)",
        },
        dark: {
          bg: "#131517",
          card: "#1a1d21",
          border: "#2a2d33",
          hover: "#22252a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(249, 115, 22, 0.1)",
        card: "0 4px 24px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
}

export default config
