import axios from "axios";
import { Box, Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import type { ApiAnimeResponse, Episode } from "../types/typeApi";
import SearchTextField from "../components/SearchTextField";

const EpisodeCard = styled(Link)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  width: 100%;
  height: 180px;
  &:hover {
    transform: scale(1.02);
  }
`;

const EpisodeImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  flex-shrink: 0;
`;

const EpisodeInfo = styled(Box)`
  padding: 10px;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-height: 0;
`;

const EpisodeNumber = styled(Typography)`
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  span {
    color: #ff8c00;
  }
`;

const EpisodeTitle = styled(Typography)`
  color: #999;
  font-size: 12px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Anime = () => {
  const { id } = useParams();
  const [page] = useState(1);
  const [eps, setEps] = useState<Episode[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const response = await axios.get<ApiAnimeResponse>(
        `http://localhost:8000/animes?slug=${encodeURIComponent(
          id
        )}&page=${page}`
      );
      setEps(response.data.data);
    };
    fetchData();
  }, [id, page]);

  const getImageUrl = (episode: Episode) =>
    `https://static.api-vidios.net/images/animes/screens/${episode.anime.slug_serie}/${episode.n_episodio}.jpg`;

  return (
    <Box sx={{ p: 3, bgcolor: "#000", minHeight: "100vh" }}>
      <Box sx={{p:4}}>
        <SearchTextField />
      </Box>
      <Grid container spacing={2}>
        {eps.length > 0 ? (
          eps.map((e) => (
            <Grid key={e.id_series_episodios} size={2}>
              <EpisodeCard
                to={`/watch/${id}?anime=${e.anime.slug_serie}&ep=${e.n_episodio}`}
              >
                <EpisodeImage
                  src={getImageUrl(e)}
                  alt={`${e.anime.slug_serie}-${e.n_episodio}`}
                  loading="lazy"
                />
                <EpisodeInfo>
                  <EpisodeNumber variant="body2">
                    EPISÓDIO <span>{e.n_episodio}</span>
                  </EpisodeNumber>
                  <EpisodeTitle variant="caption">
                    {e.titulo_episodio || "—"}
                  </EpisodeTitle>
                </EpisodeInfo>
              </EpisodeCard>
            </Grid>
          ))
        ) : (
          <div></div>
        )}
      </Grid>
    </Box>
  );
};

export default Anime;
