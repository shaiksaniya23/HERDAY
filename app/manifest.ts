import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HERDAY",
    short_name: "HERDAY",
    description:
      "Your opportunities. Your deadlines. Your next step.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF5DD",
    theme_color: "#306D29",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "500x500",
        type: "image/png",
      },
    ],
  };
}