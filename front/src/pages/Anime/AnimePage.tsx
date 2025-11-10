// src/pages/AnimePage/AnimePage.tsx
import { Grid, Box, Skeleton, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import SearchTextField from "@/components/SearchTextField";
import EpisodeCard from "@/components/EpisodeCard/EpisodeCard";
import AnimeHero from "@/components/AnimeHero/AnimeHero";
import { useAnimeEpisodes } from "./Anime.hooks";
import { Page, EpisodesSection, SectionTitle } from "./Anime.styles";
import { useEffect } from "react";

type RouteParams = { id: string };

export default function AnimePage() {
  const { id } = useParams<RouteParams>();
  const { episodes, loading, error, data, loadMoreEpisodes, hasNextPage } =
    useAnimeEpisodes(id);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight
      )
        return;
      if (hasNextPage) {
        loadMoreEpisodes();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, loadMoreEpisodes]);

  return (
    <Page>
      <Box sx={{ p: 4 }}>
        <SearchTextField />
      </Box>

      {!loading && data && (
        <AnimeHero
          title={data.titulo}
          posterUrl={`https://static.api-vidios.net/images/animes/capas/${data.slug_serie}.jpg`}
          score={data.score}
          ageRating={data.censura}
          year={data.ano}
          genres={data.generos}
          synopsis={data.sinopse}
          favoriteCount={data.favAnimes}
        />
      )}

      {loading && episodes.length === 0 && (
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rounded" height={350} />
        </Box>
      )}

      {error && <Alert severity="error">Falha ao carregar episódios.</Alert>}

      {/* Seção de Episódios */}
      <EpisodesSection>
        <SectionTitle>Episódios</SectionTitle>
        <Grid container spacing={2}>
          {episodes.map((e) => (
            <Grid key={e.id_series_episodios} size={2}>
              <EpisodeCard episode={e} />
            </Grid>
          ))}
          {loading &&
            episodes.length > 0 &&
            Array.from({ length: 12 }).map((_, i) => (
              <Grid key={i} size={2}>
                <Skeleton variant="rounded" height={180} />
              </Grid>
            ))}
        </Grid>
      </EpisodesSection>
    </Page>
  );
}
