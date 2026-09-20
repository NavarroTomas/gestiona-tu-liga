import type { Metadata } from "next";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: path,
      siteName: "APA PSO Argentina",
      title: `${title} | APA PSO Argentina`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | APA PSO Argentina`,
      description,
    },
  };
}
