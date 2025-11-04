import { Box, Typography } from "@mui/material";
import CardPlayer from "../components/CardPlayer";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { EpNavButton } from "../components/EpNavButtons";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledLink = styled(Link)`
  color: #ff4500;
  font-size: 24px;
  font-weight: bold;
  padding: 0, 8px, 8px 16px;
  text-decoration: none;
  display: inline-block;
  border-radius: 4px;
  font-family: Arial, sans-serif;
  transition: all 0.3s ease;

  &:hover {
    color: #ff5722;
  }
`;

const VideoPlayer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams();
  const [titulo, setTitulo] = useState("");
  const [temProximo, setTemProximo] = useState(false);

  const anime = searchParams.get("anime");
  const epStr = searchParams.get("ep");

  if (!anime || !epStr) return null;

  const ep = Number(epStr);
  const m3u8Url = `http://localhost:8000/m3u8?nome=${encodeURIComponent(
    anime
  )}&ep=${encodeURIComponent(ep)}`;

  const getImageUrl = (ep: number) =>
    `https://static.api-vidios.net/images/animes/screens/${anime}/${ep}.jpg`;

  const goTo = (num: number) =>
    navigate(`/watch/${id}?anime=${encodeURIComponent(anime)}&ep=${num}`);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const response = await axios.get(
        `http://localhost:8000/detalhes?slug=${encodeURIComponent(id)}`
      );
      setTitulo(response.data.pageProps.data.originaltitulo);
      setTemProximo(response.data.pageProps.data.episodes > ep);
    };
    fetchData();
  }, [id, anime, ep]);

  return (
    <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", mt: 2 }}>
      <CardPlayer src={m3u8Url} thumbnail={getImageUrl(ep)} />

      <StyledLink to={`/a/${id}`}>{titulo}</StyledLink>
      <Typography>Episodio {ep}</Typography>
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        <Box
          sx={{ gridColumn: temProximo ? "auto" : { xs: "1", sm: "1 / -1" } }}
        >
          <EpNavButton
            label="Anterior"
            epNumber={ep - 1}
            thumbUrl={getImageUrl(Number(ep) - 1)}
            $align="left"
            onClick={() => goTo(ep - 1)}
          />
        </Box>
        {temProximo && (
          <EpNavButton
            label="Próximo"
            epNumber={ep + 1}
            thumbUrl={getImageUrl(Number(ep) + 1)}
            $align="right"
            onClick={() => goTo(ep + 1)}
          />
        )}
      </Box>
    </Box>
  );
};

export default VideoPlayer;
