// src/hooks/Anime.hooks.ts
import { useEffect, useState, useCallback } from "react";
import type { DetalhesAnimeResponse, Episode } from "@/types/api";
import { fetchAnimeBySlug, fetchDetalhesAnimeBySlug } from "@/services/anime";

export function useAnimeEpisodes(slug: string, order: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<
    DetalhesAnimeResponse["pageProps"]["data"] | null
  >(null);

  useEffect(() => {
    if (!slug) return;

    let active = true;

    async function fetchDetails() {
      setLoadingDetails(true);
      try {
        const result = await fetchDetalhesAnimeBySlug(slug);
        if (!active) return;
        setData(result.pageProps.data);
      } catch (err) {
        console.error(err);
        if (active) setError(true);
      } finally {
        if (active) setLoadingDetails(false);
      }
    }

    fetchDetails();
    return () => {
      active = false;
    };
  }, [slug]);

  // funçao para carregar mais
  const loadMoreEpisodes = useCallback(async () => {
    if (!slug || !hasNextPage || loadingEpisodes) return;
    setLoadingEpisodes(true);
    setError(false);
    try {
      const res = await fetchAnimeBySlug(slug, page, order);
      setEpisodes((prev) => [...prev, ...res.data]);
      setHasNextPage(res.meta.hasNextPage);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(true);
    } finally {
      setLoadingEpisodes(false);
    }
  }, [slug, page, hasNextPage, loadingEpisodes, order]);
  
  useEffect(() => {
    let active = true;
    async function run() {
      if (!slug) return;
      setLoadingEpisodes(true);
      setError(false);
      try {
        const res = await fetchAnimeBySlug(slug, 1, order);
        if (active) {
          setEpisodes(res.data);
          setHasNextPage(res.meta.hasNextPage);
          setPage(2);
        }
      } catch (err) {
        if (active) setError(true);
      } finally {
        if (active) setLoadingEpisodes(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [slug, order]);

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

  return { episodes, loadingEpisodes, loadingDetails, error, data };
}
