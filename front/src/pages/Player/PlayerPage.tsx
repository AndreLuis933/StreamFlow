import { Box, Typography, Skeleton, Alert } from "@mui/material";
import CardPlayer from "@/components/CardPlayer";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { EpNavButton } from "@/components/EpNavButtons";
import { useMemo } from "react";
import { getEpisodeImageUrlBySlug } from "@/utils/images";
import { Page, TitleLink } from "./Player.styles";
import { usePlayerData } from "./Player.hooks";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

type RouteParams = { id: string };

export default function PlayerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams<RouteParams>();

  const anime = searchParams.get("anime") ?? undefined;
  const ep = useMemo(() => {
    const s = searchParams.get("ep");
    const n = s ? Number(s) : NaN;
    return Number.isFinite(n) ? n : undefined;
  }, [searchParams]);

  // Early return se params essenciais estiverem ausentes
  if (!anime || !ep || !id) {
    return (
      <Page>
        <Alert severity="warning">Parâmetros inválidos na URL.</Alert>
      </Page>
    );
  }

  const m3u8Url = `${API_BASE}/m3u8?nome=${encodeURIComponent(
    anime
  )}&ep=${encodeURIComponent(ep)}`;

  const thumb = getEpisodeImageUrlBySlug(anime, ep);

  const goTo = (num: number) =>
    navigate(`/watch/${id}?anime=${encodeURIComponent(anime)}&ep=${num}`);

  const { titulo, temProximo, loading, error } = usePlayerData(id, ep);

  return (
    <Page>
      {loading ? (
        <Skeleton variant="rounded" height={540} />
      ) : error ? (
        <Alert severity="error">Falha ao carregar detalhes.</Alert>
      ) : (
        <Box>
          <CardPlayer src={m3u8Url} thumbnail={thumb} />

          <TitleLink to={`/a/${id}`}>{titulo}</TitleLink>

          <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
            Episódio {ep}
          </Typography>

          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            {ep > 1 && (
              <Box
                sx={{
                  gridColumn: temProximo ? "auto" : { xs: "1", sm: "1 / -1" },
                }}
              >
                <EpNavButton
                  label="Anterior"
                  epNumber={ep - 1}
                  thumbUrl={getEpisodeImageUrlBySlug(anime, ep - 1)}
                  $align="left"
                  onClick={() => goTo(ep - 1)}
                />
              </Box>
            )}

            {temProximo && (
              <EpNavButton
                label="Próximo"
                epNumber={ep + 1}
                thumbUrl={getEpisodeImageUrlBySlug(anime, ep + 1)}
                $align="right"
                onClick={() => goTo(ep + 1)}
              />
            )}
          </Box>
        </Box>
      )}
    </Page>
  );
}
