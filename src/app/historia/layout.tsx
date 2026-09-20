import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Historia",
  description: "Historia, campeones, temporadas y momentos destacados de APA PSO Argentina.",
  path: "/historia",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
