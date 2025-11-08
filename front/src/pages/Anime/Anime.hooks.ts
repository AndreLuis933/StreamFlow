import { useEffect, useState } from "react";

import type { Episode } from "@/types/api";
import { fetchAnimeBySlug, fetchDetalhesAnimeBySlug } from "@/services/anime";
import { useQuery } from "@tanstack/react-query";

export function useAnimeEpisodes(slug?: string, page = 1) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const { data } = useQuery({
    queryKey: ["anime", slug], // Chave única para o cache
    queryFn: async () => {
      if (!slug) throw new Error("Slug é obrigatório");
      const result = await fetchDetalhesAnimeBySlug(slug);
      return result.pageProps.data;
    },
    enabled: !!slug, // Só executa se slug existir
    staleTime: 1000 * 60 * 5, // 5 minutos
  });;

  useEffect(() => {
    let active = true;
    async function run() {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const res = await fetchAnimeBySlug(slug, page);
        if (active) setEpisodes(res.data);
      } catch (err) {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [slug, page]);

  return { episodes, loading, error, data };
}
