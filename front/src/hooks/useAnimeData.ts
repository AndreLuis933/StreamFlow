import { useQuery } from "@tanstack/react-query";
import { fetchDetalhesEpBySlug } from "@/services/anime";

export function useAnimeData(slug?: string) {
  return useQuery({
    queryKey: ["anime", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug é obrigatório");
      const result = await fetchDetalhesEpBySlug(slug);
      return result;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}
