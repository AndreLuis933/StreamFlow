import axios from "@/lib/axios";
import type {
  ApiAnimeResponse,
  ApiDataResponse,
  DetalhesEpResponse,
} from "@/types/api";
import { parseAnimeResponse } from "@/utils/prosessData";

export async function fetchAnimeBySlug(slug: string, page = 1) {
  const { data } = await axios.get<ApiAnimeResponse>(
    `/animes?slug=${encodeURIComponent(slug)}&page=${page}`
  );
  return data;
}

export async function fetchDetalhesAnimeBySlug(slug: string) {
  const { data } = await axios.get(
    `/detalhes/anime?slug=${encodeURIComponent(slug)}`
  );
  return parseAnimeResponse(data);
}

export async function fetchDetalhesEpBySlug(slug: string) {
  const { data } = await axios.get<DetalhesEpResponse>(
    `/detalhes/episodio?slug=${encodeURIComponent(slug)}`
  );
  return data;
}

export async function fetchAnimeBySearch(search: string) {
  const { data } = await axios.get<ApiDataResponse>(
    `data?q=${encodeURIComponent(search)}`
  );
  return data;
}

interface Response {
  end_sec: number;
  start_sec: number;
}

export async function fetchIntroDuration(anime: string, ep: string) {
  const { data } = await axios.get<Response>(
    `intro?anime=${encodeURIComponent(anime)}&ep=${ep}`,
    { timeout: 60000 }
  );
  return data;
}
