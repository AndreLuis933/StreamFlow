interface SerieInfoFromS3 {
	id: number;
	generos: string[];
	title: string;
	slug_serie: string;
	ano: number;
	censura: number;
	sinopse: string;
	data_registro: string;
	episodes: string[];
}

interface EpisodeMetadataFromS3 {
	n_episodio: string;
	titulo_episodio: string;
	sinopse_episodio: string;
	data_registro: string;
	slug_serie: string;
}
