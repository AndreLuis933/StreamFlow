import {
  Grid,
  Skeleton,
  Typography,
  Box,
  Tabs,
  Tab,
  CardContent,
  Alert,
} from "@mui/material";
import EpisodeCard from "@/components/EpisodeCard/EpisodeCard";
import { EpisodesSection, SectionTitle } from "@/components/EpisodesSection";

import { useFavorito } from "./Favorito.hooks";
import * as S from "./Favorito.styles";
import { getSerieImageUrlBySlug } from "@/utils/images";

export default function Favorito() {
  const {
    currentUser,
    tabValue,
    handleTabChange,
    favorites,
    loadingFavorites,
    episodes,
    isLoading,
    navigate,
  } = useFavorito();

  if (!currentUser) {
    return (
      <Alert severity="info">
        Precisa estar logado para cadastrar series favoritos
      </Alert>
    );
  }

  return (
    <EpisodesSection>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Abas de favoritos"
        >
          <Tab label="Últimos Episódios" />
          <Tab label="Minhas Series" />
        </Tabs>
      </Box>

      {/* TAB 1: ÚLTIMOS EPISÓDIOS */}
      {tabValue === 0 && (
        <>
          <SectionTitle>Novos Episódios</SectionTitle>
          <Grid container spacing={2}>
            {episodes.map((e) => (
              <Grid key={e.n_episodio} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <EpisodeCard episode={e} />
              </Grid>
            ))}

            {/* Skeleton Tab 1 */}
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                  <Skeleton variant="rounded" height={180} />
                </Grid>
              ))}
          </Grid>

          {!isLoading && episodes.length === 0 && (
            <Typography variant="body1" color="text.secondary">
              Nenhum episódio novo encontrado para seus favoritos.
            </Typography>
          )}
        </>
      )}

      {/* TAB 2: LISTA DE Series (CAPA + TÍTULO) */}
      {tabValue === 1 && (
        <>
          <SectionTitle>Biblioteca</SectionTitle>
          <Grid container spacing={2}>
            {favorites.map((serie) => (
              <Grid key={serie.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <S.SerieCard>
                  <S.SerieActionArea onClick={() => navigate(`/serie/${serie.id}`)}>
                    <S.SerieCover
                      component="img"
                      image={getSerieImageUrlBySlug(serie.slug)}
                      alt={serie.title}
                    />
                    <CardContent sx={{ p: 1.5, width: "100%" }}>
                      <S.SerieTitle variant="subtitle2">
                        {serie.title}
                      </S.SerieTitle>
                    </CardContent>
                  </S.SerieActionArea>
                </S.SerieCard>
              </Grid>
            ))}

            {loadingFavorites &&
              Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                  <Skeleton variant="rounded" height={220} />
                  <Skeleton variant="text" sx={{ mt: 1 }} />
                </Grid>
              ))}
          </Grid>

          {!loadingFavorites && favorites.length === 0 && (
            <Typography variant="body1" color="text.secondary">
              Você ainda não adicionou nenhuma serie aos favoritos.
            </Typography>
          )}
        </>
      )}
    </EpisodesSection>
  );
}
