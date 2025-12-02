import { fetchDetalhesMovieBySlug } from "@/services/anime";
import { useQuery } from "@tanstack/react-query";

export function useMovieData(slug?: string) {
  return useQuery({
    queryKey: ["ep", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Slug é obrigatório");
      const result = await fetchDetalhesMovieBySlug(slug);
      return result.pageProps.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}
