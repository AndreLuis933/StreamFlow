import { fetchDetalhesEpBySlug } from "@/services/serie";
import { useQuery } from "@tanstack/react-query";

export function usePlayerData(slug?: string) {
  return useQuery({
    queryKey: ["ep", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug é obrigatório");
      const result = await fetchDetalhesEpBySlug(slug);
      return result;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}
