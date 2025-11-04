export interface ApiAnimeResponse {
  code: number;
  meta: {
    timestamp: number;
    totalOfEpisodes: number;
    totalOfPages: number;
    pageNumber: number;
    order: string;
    hasNextPage: boolean;
  };
  message: string;
  data: Episode[];
}

export interface Episode {
  id_series_episodios: number;
  se_pgad: number;
  id_serie: number;
  premiere_last_ep: number;
  n_episodio: string;
  titulo_episodio: string;
  sinopse_episodio: string;
  link: string;
  v_stream: string | null;
  aviso: string;
  generate_id: string;
  data_registro: string;
  anime: AnimeInfo;
}

export interface AnimeInfo {
  titulo: string;
  slug_serie: string;
  generate_id: string;
}

export type ApiDataResponse = {
  code: number;
  message: string;
  data: {
    id: number | string;
    title: string;
    type: string;
    slug: string;
    generic_path: string;
    synopsis: string;
  }[];
};