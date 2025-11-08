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

export interface DetalhesAnimeResponse {
  pageProps: {
    data: {
      id_serie: number;
      pgad: number;
      dub: number;
      generos: string[];
      score: number;
      titulo: string;
      originaltitulo: string;
      slug_serie: string;
      ano: number;
      diretor: string;
      elenco: string;
      duracao: string;
      origem: string;
      censura: number;
      sinopse: string;
      aviso: string;
      generate_id: string;
      data_registro: string;
      episodes: number;
      favAnimes: number;
      calendar_anime: {
        name: string | null;
        comments: string | null;
        day: number;
        wasFound: boolean;
      };
    };
    randomscreen: string;
    generated_id: string;
    id_serie: number;
  };
  __N_SSG: boolean;
}

export interface DetalhesEpResponse {
  pageProps: {
    data: {
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
      anime: {
        pgad: number;
        titulo: string;
        slug_serie: string;
        generate_id: string;
        data_registro: string;
      };
      prevEp: {
        id_series_episodios: number;
        n_episodio: string;
        titulo_episodio: string;
        generate_id: string;
        anime: {
          titulo: string;
          slug_serie: string;
        };
      } | null;
      nextEp: {
        id_series_episodios?: number;
        n_episodio?: string;
        titulo_episodio?: string;
        generate_id?: string;
        anime?: {
          titulo: string;
          slug_serie: string;
        };
      };
      bloggerUrlFile: string;
    };
    cookies: string;
  };
  __N_SSG: boolean;
}