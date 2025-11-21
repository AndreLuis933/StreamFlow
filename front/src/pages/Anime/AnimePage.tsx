import { Grid, Box, Skeleton, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import EpisodeCard from "@/components/EpisodeCard/EpisodeCard";
import AnimeHero from "@/components/AnimeHero/AnimeHero";
import { useAnimeEpisodes } from "./Anime.hooks";
import { EpisodesSection, SectionTitle } from "@/components/EpisodesSection";
import { useAuth } from "@/context/AuthContext";
import { isFavorite, saveFavorite } from "@/services/firebase";
import { useEffect, useState } from "react";

type RouteParams = { id: string };

export default function AnimePage() {
  const { id } = useParams<RouteParams>();
  const [favoritado, setFavoritado] = useState(false);
  if (!id) {
    return <Alert severity="warning">Parâmetros inválidos na URL.</Alert>;
  }
  const { episodes, loading, error, data } = useAnimeEpisodes(id);
  const { currentUser } = useAuth();

  let userId: string | null = null;
  if (currentUser) {
    userId = currentUser.uid;
  }
  const handleFavoritar = () => {
    if (!data) return ;
    if (!userId) return alert("So pode favoritar se estiver logado");
    const favorito = !favoritado;
    saveFavorite(userId, id, data.titulo, data.slug_serie, favorito);
    setFavoritado(favorito);
  };
  useEffect(() => {
    const checarFavorito = async () => {
      if (!userId) return;
      const resposta = await isFavorite(userId, id);
      setFavoritado(resposta);
    };

    checarFavorito();
  }, [userId, id]);

  return (
    <>
      {!loading && data && (
        <AnimeHero
          title={data.titulo}
          posterUrl={`https://static.api-vidios.net/images/animes/capas/${data.slug_serie}.jpg`}
          score={data.score}
          ageRating={data.censura}
          year={data.ano}
          genres={data.generos}
          synopsis={data.sinopse}
          handleFavoritar={handleFavoritar}
          isFavorite={favoritado}
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
    </>
  );
}
