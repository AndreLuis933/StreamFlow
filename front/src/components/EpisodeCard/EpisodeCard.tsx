import { memo } from "react";
import { Card, Image, Info, Number, Title } from "./EpisodeCard.styles";
import type { Episode } from "@/types/api";
import { getEpisodeImageUrlBySlug } from "@/utils/images";

type Props = {
  episode: Episode;
  baseSlug: string;
};

function EpisodeCard({ episode, baseSlug }: Props) {
  return (
    <Card
      to={`/watch/${baseSlug}?anime=${episode.anime.slug_serie}&ep=${episode.n_episodio}`}
    >
      <Image
        src={getEpisodeImageUrlBySlug(
          episode.anime.slug_serie,
          episode.n_episodio
        )}
        alt={`${episode.anime.slug_serie}-${episode.n_episodio}`}
        loading="lazy"
      />
      <Info>
        <Number variant="body2">
          EPISÓDIO <span>{episode.n_episodio}</span>
        </Number>
        <Title variant="caption">{episode.titulo_episodio || "—"}</Title>
      </Info>
    </Card>
  );
}

export default memo(EpisodeCard);
