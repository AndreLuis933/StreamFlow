import axios from "@/lib/axios";
import type { ApiAnimeResponse, ApiDataResponse } from "@/types/api";

export async function fetchAnimeBySlug(slug: string, page = 1) {
  const { data } = await axios.get<ApiAnimeResponse>(
    `/animes?slug=${encodeURIComponent(slug)}&page=${page}`
  );
  return data;
}

type DetalhesResponse = {
  pageProps: {
    data: {
      originaltitulo: string;
      episodes: number;
    };
  };
};

export async function fetchDetalhesBySlug(slug: string) {
  const { data } = await axios.get<DetalhesResponse>(
    `/detalhes?slug=${encodeURIComponent(slug)}`
  );
  return data;
}

export async function fetchAnimeBySearch(search: string) {
  const { data } = await axios.get<ApiDataResponse>(
    `data?q=${encodeURIComponent(search)}`
  );
  return data;
}