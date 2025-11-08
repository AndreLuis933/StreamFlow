import { useQuery } from "@tanstack/react-query";
import { fetchDetalhesEpBySlug } from "@/services/anime";

export function useAnimeData(slug?: string) {
  return useQuery({
    queryKey: ["anime", slug], // Chave única para o cache
    queryFn: async () => {
      if (!slug) throw new Error("Slug é obrigatório");
      const result = await fetchDetalhesEpBySlug(slug);
      return result.pageProps.data;
    },
    enabled: !!slug, // Só executa se slug existir
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
