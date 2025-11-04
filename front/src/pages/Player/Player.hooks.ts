import { useEffect, useState } from "react";
import { fetchDetalhesBySlug } from "@/services/anime";

export function usePlayerData(slug?: string, ep?: number) {
  const [titulo, setTitulo] = useState("");
  const [temProximo, setTemProximo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!slug || !ep) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDetalhesBySlug(slug);
        if (!active) return;
        const original = data.pageProps.data.originaltitulo;
        const total = data.pageProps.data.episodes;
        setTitulo(original);
        setTemProximo(total > ep);
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
  }, [slug, ep]);

  return { titulo, temProximo, loading, error };
}