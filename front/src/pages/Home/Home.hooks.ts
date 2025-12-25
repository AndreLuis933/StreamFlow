import { fetchCatalago, fetchDetalhesAnimeBySlug } from "@/services/anime";
import type { DetalhesAnimeResponse } from "@/types/api";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function useHome() {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<DetalhesAnimeResponse[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetch() {
      const catalago = await fetchCatalago();
      for (const serie of catalago.series) {
        const data = await fetchDetalhesAnimeBySlug(serie);
        setEpisodes((prev) => [...prev, data]);
      }
    }
    fetch();
  }, []);

  return { navigate, episodes };
}
