import { Grid, Box, Skeleton, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import SearchTextField from "@/components/SearchTextField";
import EpisodeCard from "@/components/EpisodeCard/EpisodeCard";
import { useAnimeEpisodes } from "./Anime.hooks";
import { Page } from "./Anime.styles";

type RouteParams = { id: string };

export default function AnimePage() {
  const { id } = useParams<RouteParams>();
  const page = 1;
  const { episodes, loading, error } = useAnimeEpisodes(id, page);

  return (
    <Page>
      <Box sx={{ p: 4 }}>
        <SearchTextField />
      </Box>

      {error ? (
        <Alert severity="error">Falha ao carregar episódios.</Alert>
      ) : null}

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Grid key={i} size={2}>
                <Skeleton variant="rounded" height={180} />
              </Grid>
            ))
          : episodes.map((e) => (
              <Grid key={e.id_series_episodios} size={2}>
                <EpisodeCard episode={e} baseSlug={id!} />
              </Grid>
            ))}
      </Grid>
    </Page>
  );
}
