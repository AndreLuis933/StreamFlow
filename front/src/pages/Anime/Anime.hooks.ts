// src/hooks/Anime.hooks.ts
import { useEffect, useState, useCallback } from "react";
import type { Episode } from "@/types/api";
import { fetchAnimeBySlug, fetchDetalhesAnimeBySlug } from "@/services/anime";
import { useQuery } from "@tanstack/react-query";

export function useAnimeEpisodes(slug?: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["anime", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug é obrigatório");
      const result = await fetchDetalhesAnimeBySlug(slug);
      return result.pageProps.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  // funçao para carregar mais
  const loadMoreEpisodes = useCallback(async () => {
    if (!slug || !hasNextPage || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetchAnimeBySlug(slug, page);
      setEpisodes((prev) => [...prev, ...res.data]);
      setHasNextPage(res.meta.hasNextPage);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, page, hasNextPage, loading]);

  //primeira busca
  useEffect(() => {
    let active = true;
    async function run() {
      if (!slug) return;
      setLoading(true);
      setError(false);
      try {
        const res = await fetchAnimeBySlug(slug, 1);
        if (active) {
          setEpisodes(res.data);
          setHasNextPage(res.meta.hasNextPage);
          setPage(2);
        }
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
  }, [slug]);

  // carregar mais com o scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight
      )
        return;
      if (hasNextPage) {
        loadMoreEpisodes();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, loadMoreEpisodes]);

  return { episodes, loading, error, data };
}
