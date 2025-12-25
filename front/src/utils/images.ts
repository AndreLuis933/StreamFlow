export function getEpisodeImageUrlBySlug(slugSerie: string, ep: number | string) {
  const epStr = String(ep).padStart(2, '0');
    return `${
      import.meta.env.VITE_API_BASE_URL_PROXY
    }/images/episode?slug=${slugSerie}&ep=${epStr}`;
}

export function getFilmeImageUrlBySlug(
  slugSerie: string,

) {

  return `https://static.api-vidios.net/images/filmes/capas/${slugSerie}.jpg`;
}

export function getSerieImageUrlBySlug(
  slugSerie: string,
) {
  return `${
    import.meta.env.VITE_API_BASE_URL_PROXY
  }/images/capa?slug=${slugSerie}`;
}