"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  normalizeHomeEditorDocument,
  type HomeEditorDocument,
} from "@/lib/siteEditor";

export function usePublishedHomeDocument(enabled = true) {
  const [document, setDocument] = useState<HomeEditorDocument>(DEFAULT_HOME_EDITOR_DOCUMENT);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_public_pages")
        .select("document")
        .eq("page_key", "home")
        .maybeSingle();

      if (!active) return;
      if (!error && data?.document) {
        setDocument(normalizeHomeEditorDocument(data.document));
      }
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [enabled]);

  return { document, loading };
}
