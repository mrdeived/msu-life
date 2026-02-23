import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beaver App",
    short_name: "Beaver",
    description: "Beaver App — Campus events & engagement",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c8102e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
