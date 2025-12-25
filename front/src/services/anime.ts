import axios from "@/lib/axios";
import axiosLib from "axios";
import type {
  ApiAnimeResponse,
  ApiDataResponse,
  DetalhesAnimeResponse,
  DetalhesEpResponse,
  DetalhesFilmeResponse,
} from "@/types/api";
import { parseAnimeResponse } from "@/utils/prosessData";

const apiANALYSIS = axiosLib.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_ANALYSIS,
  timeout: 10000,
  headers: { "x-api-key": "LzAfuia49275xn0ugGty8174ghVyRH9aa9JUVfSt" },
});

export async function fetchAnimeBySlug(
  slug: string,
  page: number,
  order: string
) {
  const { data } = await axios.get<ApiAnimeResponse>(
    `/serie?slug=${encodeURIComponent(slug)}&page=${page}&order=${order}`
  );
  return data;
}

export async function fetchDetalhesAnimeBySlug(slug: string) {
  const { data } = await axios.get<DetalhesAnimeResponse>(
    `/detalhes/serie?slug=${encodeURIComponent(slug)}`
  );
  return data;
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

export async function fetchIntroDuration(anime: string, ep: string) {
  const { data } = await apiANALYSIS.get<void>(
    `intro?nome=${encodeURIComponent(anime)}&ep=${ep}`
  );
  return data;
}

export async function fetchCreditsDuration(anime: string, ep: string) {
  const { data } = await apiANALYSIS.get<void>(
    `credits?nome=${encodeURIComponent(anime)}&ep=${ep}`
  );
  return data;
}

interface ResponseCatalago{
"series":string[]
}

export async function fetchCatalago() {
  const { data } = await axios.get<ResponseCatalago>("catalago");
  return data;
}
