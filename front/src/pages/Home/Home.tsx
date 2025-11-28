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

// Imports dos arquivos criados
import { useHome } from "./Home.hooks";
import * as S from "./Home.styles";

export default function Home() {
  const {
    currentUser,
    tabValue,
    handleTabChange,
    favorites,
    loadingFavorites,
    episodes,
    isLoading,
    navigate,
  } = useHome();

  if (!currentUser) {
    return (
      <Alert severity="info">
        Precisa estar logado para cadastrar animes favoritos
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
          <Tab label="Meus Animes" />
        </Tabs>
      </Box>

      {/* TAB 1: ÚLTIMOS EPISÓDIOS */}
      {tabValue === 0 && (
        <>
          <SectionTitle>Novos Episódios</SectionTitle>
          <Grid container spacing={2}>
            {episodes.map((e) => (
              <Grid
                key={e.id_series_episodios}
                size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
              >
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

      {/* TAB 2: LISTA DE ANIMES (CAPA + TÍTULO) */}
      {tabValue === 1 && (
        <>
          <SectionTitle>Biblioteca</SectionTitle>
          <Grid container spacing={2}>
            {favorites.map((anime) => (
              <Grid key={anime.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <S.AnimeCard>
                  <S.AnimeActionArea onClick={() => navigate(`/a/${anime.id}`)}>
                    <S.AnimeCover
                      component="img"
                      image={`https://static.api-vidios.net/images/animes/capas/${anime.slug}.jpg`}
                      alt={anime.title}
                    />
                    <CardContent sx={{ p: 1.5, width: "100%" }}>
                      <S.AnimeTitle variant="subtitle2">
                        {anime.title}
                      </S.AnimeTitle>
                    </CardContent>
                  </S.AnimeActionArea>
                </S.AnimeCard>
              </Grid>
            ))}

            {/* Skeleton Tab 2 */}
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
              Você ainda não adicionou nenhum anime aos favoritos.
            </Typography>
          )}
        </>
      )}
    </EpisodesSection>
  );
}
