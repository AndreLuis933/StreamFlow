export function getEpisodeImageUrlBySlug(slugSerie: string, ep: number|string) {
  return `https://static.api-vidios.net/images/animes/screens/${slugSerie}/${ep}.jpg`;
}