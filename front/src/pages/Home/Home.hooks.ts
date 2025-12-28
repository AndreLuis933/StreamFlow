import { fetchCatalago, fetchDetalhesSerieBySlug } from "@/services/serie";
import type { DetalhesSerieResponse } from "@/types/api";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function useHome() {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<DetalhesSerieResponse[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetch() {
      const catalago = await fetchCatalago();
      for (const serie of catalago.series) {
        const data = await fetchDetalhesSerieBySlug(serie);
        setEpisodes((prev) => [...prev, data]);
      }
    }
    fetch();
  }, []);

  return { navigate, episodes };
}
