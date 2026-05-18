import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18201d",
        felt: "#28725d",
        chalk: "#f6f2e8",
        gold: "#d8a03d",
        coral: "#de6b55"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(24, 32, 29, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
