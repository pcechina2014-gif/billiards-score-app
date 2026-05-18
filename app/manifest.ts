import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "台球对战记录",
    short_name: "台球战绩",
    description: "陈振明和何烈的台球战绩记录与统计",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f2e8",
    theme_color: "#28725d",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ]
  };
}
