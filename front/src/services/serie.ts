import axios from "@/lib/axios";
import axiosLib from "axios";
import type {
  ApiSerieResponse,
  DetalhesSerieResponse,
  DetalhesEpResponse,
  DetalhesFilmeResponse,
  ResponseCatalago,
} from "@/types/api";

const apiANALYSIS = axiosLib.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_ANALYSIS,
  timeout: 10000,
  headers: { "x-api-key": "LzAfuia49275xn0ugGty8174ghVyRH9aa9JUVfSt" },
});

export async function fetchSerieBySlug(
  slug: string,
  page: number,
  order: string
) {
  const { data } = await axios.get<ApiSerieResponse>(
    `/serie?slug=${encodeURIComponent(slug)}&page=${page}&order=${order}`
  );
  return data;
}

export async function fetchDetalhesSerieBySlug(slug: string) {
  const { data } = await axios.get<DetalhesSerieResponse>(
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

export async function fetchIntroDuration(serie: string, ep: string) {
  const { data } = await apiANALYSIS.get<void>(
    `intro?nome=${encodeURIComponent(serie)}&ep=${ep}`
  );
  return data;
}

export async function fetchCreditsDuration(serie: string, ep: string) {
  const { data } = await apiANALYSIS.get<void>(
    `credits?nome=${encodeURIComponent(serie)}&ep=${ep}`
  );
  return data;
}


export async function fetchCatalago() {
  const { data } = await axios.get<ResponseCatalago>("catalago");
  return data;
}
