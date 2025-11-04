import { useEffect, useState } from "react";

import type { Episode } from "@/types/api";
import { fetchAnimeBySlug } from "@/services/anime";

export function useAnimeEpisodes(slug?: string, page = 1) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAnimeBySlug(slug, page);
        if (active) setEpisodes(res.data);
      } catch (err) {
        if (active) setError(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [slug, page]);

  return { episodes, loading, error };
}