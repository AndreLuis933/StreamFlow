export interface ApiAnimeResponse {
  meta: {
    timestamp: number;
    totalOfEpisodes: number;
    totalOfPages: number;
    pageNumber: number;
    order: string;
    hasNextPage: boolean;
  };
  data: Episode[];
}

export interface Episode {
  n_episodio: string;
  titulo_episodio: string;
  sinopse_episodio: string;
  data_registro: string;
  slug_serie: string;
}

export interface DetalhesAnimeResponse {
  id: number;
  generos: string[];
  score: number;
  title: string;
  slug_serie: string;
  ano: number;
  censura: number;
  sinopse: string;
  data_registro: string;
  episodes: string[];
}

export interface DetalhesEpResponse {
  id_series_episodios: number;
  id_serie: number;
  n_episodio: string;
  titulo_episodio: string;
  sinopse_episodio: string;
  generate_id: string;
  data_registro: string;
  anime: {
    titulo: string;
    slug_serie: string;
    generate_id: string;
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
}

export interface DetalhesFilmeResponse {
  pageProps: {
    data: {
      data_movie: {
        id_filme: number;
        pgad: number;
        nome_filme: string;
        nome_original: string;
        slug_filme: string;
        ano: string;
        diretor: string;
        elenco: string;
        duracao: string;
        origem: string;
        censura: string;
        sinopse_filme: string;
        od: string;
        generate_id: string;
      };
      data_user: Record<string, any>;
      total_movies: {
        total_filmes: number;
      };
    };
  };
  __N_SSG: boolean;
}

export interface ResponseCatalago {
  series: string[];
}
