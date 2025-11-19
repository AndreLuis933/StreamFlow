import axios from "@/lib/axios";
import axiosLib from "axios";
import type {
  ApiAnimeResponse,
  ApiDataResponse,
  DetalhesEpResponse,
  DetalhesFilmeResponse,
} from "@/types/api";
import { parseAnimeResponse } from "@/utils/prosessData";

const apiANALYSIS = axiosLib.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_ANALYSIS, // ou a URL que você quiser
  timeout: 60000,
});

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

export async function fetchDetalhesMovieBySlug(slug: string) {
  const { data } = await axios.get<DetalhesFilmeResponse>(
    `/detalhes/movie?slug=${encodeURIComponent(slug)}`
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
  const { data } = await apiANALYSIS.get<Response | null>(
    `intro?anime=${encodeURIComponent(anime)}&ep=${ep}`,
    { timeout: 60000 }
  );
  return data;
}

export async function fetchCreditsDuration(anime: string, ep: string) {
  const { data } = await apiANALYSIS.get<Response | null>(
    `credits?anime=${encodeURIComponent(anime)}&ep=${ep}`,
    { timeout: 60000 }
  );
  return data;
}