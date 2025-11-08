export function getEpisodeImageUrlBySlug(slugSerie: string, ep: number | string) {
  const epStr = String(ep).padStart(3, '0');
  return `https://static.api-vidios.net/images/animes/screens/${slugSerie}/${epStr}.jpg`;
}