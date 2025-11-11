// src/hooks/useEpisodesFetcher.ts
import { useEffect, useState, useCallback } from "react";
import type { Episode } from "@/types/api";
import { fetchAnimeBySlug } from "@/services/anime";

interface UseEpisodesFetcherProps {
  slugs: string[];
}

export function useEpisodesFetcher({ slugs }: UseEpisodesFetcherProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const fetchEpisodes = useCallback(async () => {
    if (slugs.length === 0) return;

    setLoading(true);
    setError(false);
    try {
      const allEpisodes: Episode[] = [];
      for (const slug of slugs) {
        const res = await fetchAnimeBySlug(slug, 1); // Busca todos os episódios da primeira página
        allEpisodes.push(...res.data);
      }

      // Ordena os episódios pela data_registro em ordem decrescente
      const sortedEpisodes = allEpisodes.sort(
        (a, b) =>
          new Date(b.data_registro).getTime() -
          new Date(a.data_registro).getTime()
      );

      setEpisodes(sortedEpisodes);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slugs]);

  useEffect(() => {
    fetchEpisodes();
  }, [slugs]);

  return { episodes, loading, error, refetch: fetchEpisodes };
}
