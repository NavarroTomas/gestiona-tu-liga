import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/login",
        "/registro",
        "/debug-user",
      ],
    },
    sitemap: "https://www.psoargentina.com/sitemap.xml",
    host: "https://www.psoargentina.com",
  };
}
