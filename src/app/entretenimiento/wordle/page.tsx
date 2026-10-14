import ApaWordleGame from "@/components/entertainment/ApaWordleGame";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Liga Wordle",
  description: "El Wordle de Gestioná tu Liga: una palabra por día inspirada en la liga y su comunidad.",
  path: "/entretenimiento/wordle",
});

export default function WordlePage() {
  return <ApaWordleGame />;
}
