import { Box, Typography, Skeleton, Alert, Stack } from "@mui/material";
import CardPlayer from "@/components/CardPlayer/CardPlayer";
import { useNavigate, useParams } from "react-router-dom";
import { EpNavButton } from "@/components/EpNavButtons";
import { getEpisodeImageUrlBySlug } from "@/utils/images";
import { PlayerContainer, TitleLink } from "./Player.styles";
import { usePlayerData } from "./Player.hooks";
import { formatarTempoDecorrido } from "@/utils/timePass";
const VITE_API_BASE_URL_PROXY = import.meta.env.VITE_API_BASE_URL_PROXY;
type RouteParams = { IdEp: string };

export default function PlayerPage() {
  const navigate = useNavigate();
  const { IdEp } = useParams<RouteParams>();

  if (!IdEp) {
    return (
      <PlayerContainer>
        <Alert severity="warning">Parâmetros inválidos na URL.</Alert>
      </PlayerContainer>
    );
  }
  const { data, isLoading, error } = usePlayerData(IdEp);
  if (!data) {
    return <></>;
  }
  const ep = Number(data.n_episodio);

  const thumb = getEpisodeImageUrlBySlug(data.anime.slug_serie, ep);

  const goTo = (slug: string) => navigate(`/watch/${slug}`);
  const src = `${VITE_API_BASE_URL_PROXY}/m3u8?nome=${encodeURIComponent(
    data.anime.slug_serie
  )}&ep=${encodeURIComponent(ep)}`;

  return (
    <PlayerContainer>
      {isLoading ? (
        <Skeleton variant="rounded" height={540} />
      ) : error ? (
        <Alert severity="error">Falha ao carregar detalhes.</Alert>
      ) : (
        <Box>
          <CardPlayer
            thumbnail={thumb}
            videoId={IdEp}
            nome={data.anime.slug_serie}
            ep={data.n_episodio}
            src={src}
            onVideoEnd={() => {
              if (data.nextEp && data.nextEp.generate_id)
                goTo(data.nextEp.generate_id);
            }}
          />
          <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
            Postado {formatarTempoDecorrido(new Date(data.data_registro))}
          </Typography>

          <TitleLink to={`/a/${data.anime.generate_id}`}>
            {data.anime.titulo}
          </TitleLink>

          <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
            Episódio {ep} - {data.titulo_episodio}
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
            Sinopse
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
            {data.sinopse_episodio}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ width: "100%" }}
          >
            {data.prevEp?.generate_id &&
              (() => {
                const prevEp = data.prevEp.generate_id;
                return (
                  <EpNavButton
                    label="Anterior "
                    epNumber={ep - 1}
                    thumbUrl={getEpisodeImageUrlBySlug(
                      data.anime.slug_serie,
                      ep - 1
                    )}
                    $align="left"
                    onClick={() => goTo(prevEp)}
                  />
                );
              })()}

            {data.nextEp?.generate_id &&
              (() => {
                const nextEpId = data.nextEp.generate_id;
                return (
                  <EpNavButton
                    label="Próximo "
                    epNumber={ep + 1}
                    thumbUrl={getEpisodeImageUrlBySlug(
                      data.anime.slug_serie,
                      ep + 1
                    )}
                    $align="right"
                    onClick={() => goTo(nextEpId)}
                  />
                );
              })()}
          </Stack>
        </Box>
      )}
    </PlayerContainer>
  );
}
