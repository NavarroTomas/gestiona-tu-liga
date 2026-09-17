import type { ReactNode } from "react";
import EditorPageNavigator from "@/components/site-editor/EditorPageNavigator";

export default function SiteEditorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <EditorPageNavigator />
      {children}
    </>
  );
}
