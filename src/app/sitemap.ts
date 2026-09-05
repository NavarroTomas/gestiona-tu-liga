import type { MetadataRoute } from "next";

const baseUrl = "https://www.psoargentina.com";

const publicRoutes = [
  "",
  "/guia",
  "/fixture",
  "/jugadores",
  "/competicion",
  "/clubes",
  "/mercado",
  "/historia",
  "/entretenimiento/predicciones",
  "/entretenimiento/predicciones/ranking",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
