import { styled } from "@mui/material/styles";
import { Card, CardMedia, Typography, CardActionArea } from "@mui/material";

export const SerieCard = styled(Card)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "0.2s",
  "&:hover": {
    transform: "scale(1.02)",
  },
}));

export const SerieActionArea = styled(CardActionArea)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
});

export const SerieCover = styled(CardMedia)({
  width: "100%",
  aspectRatio: "2/3",
  objectFit: "cover",
  objectPosition: "center",
}) as typeof CardMedia;

export const SerieTitle = styled(Typography)({
  fontWeight: "bold",
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
});
