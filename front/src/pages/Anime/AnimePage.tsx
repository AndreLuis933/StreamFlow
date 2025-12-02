import { Grid, Box, Skeleton, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import EpisodeCard from "@/components/EpisodeCard/EpisodeCard";
import AnimeHero from "@/components/AnimeHero/AnimeHero";
import { useAnimeEpisodes } from "./Anime.hooks";
import { EpisodesSection, SectionTitle } from "@/components/EpisodesSection";
import { useAuth } from "@/context/AuthContext";
import { isFavorite, saveFavorite } from "@/services/firebase";
import { useEffect, useState } from "react";

import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { FilterContainer, FilterLabel, OrderButton } from "./Anime.styles";

type RouteParams = { id: string };

export default function AnimePage() {
  const { id } = useParams<RouteParams>();
  const [favoritado, setFavoritado] = useState(false);
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  if (!id) {
    return <Alert severity="warning">Parâmetros inválidos na URL.</Alert>;
  }

  const { episodes, loadingEpisodes, loadingDetails, error, data } =
    useAnimeEpisodes(id, order);
  const { currentUser } = useAuth();

  let userId: string | null = null;
  if (currentUser) {
    userId = currentUser.uid;
  }

  const handleFavoritar = () => {
    if (!data) return;
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
      {!loadingDetails && data && (
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

      {loadingEpisodes && episodes.length === 0 && (
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rounded" height={350} />
        </Box>
      )}

      {error && <Alert severity="error">Falha ao carregar episódios.</Alert>}

      <EpisodesSection>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mb: 2,
          }}
        >

          <FilterContainer>
            <FilterLabel>Filtrar por:</FilterLabel>
            <OrderButton
              selected={order === "asc"}
              onClick={() => setOrder("asc")}
            >
              <ArrowUpward />
              Ordem crescente
            </OrderButton>
            <OrderButton
              selected={order === "desc"}
              onClick={() => setOrder("desc")}
            >
              <ArrowDownward />
              Ordem decrescente
            </OrderButton>
          </FilterContainer>
        </Box>

        <Grid container spacing={2}>
          {episodes.map((e) => (
            <Grid
              key={e.id_series_episodios}
              size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
            >
              <EpisodeCard episode={e} />
            </Grid>
          ))}
          {loadingEpisodes &&
            episodes.length > 0 &&
            Array.from({ length: 12 }).map((_, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <Skeleton variant="rounded" height={180} />
              </Grid>
            ))}
        </Grid>
      </EpisodesSection>
    </>
  );
}
