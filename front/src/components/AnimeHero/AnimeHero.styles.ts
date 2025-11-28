import { Box, Typography, Chip, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

// Container principal do card de anime (hero/capa)
export const AnimeHeroContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: 32,
  padding: 32,
  background:
    "linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(0, 0, 0, 0.8) 100%)",
  backdropFilter: "blur(10px)",
  borderRadius: 12,
  color: "#fff",
  marginBottom: 32,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)",
    zIndex: 0,
  },

  // MOBILE
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    padding: 16,
    gap: 16,
  },
}));

// Container da imagem do poster
export const PosterContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  flexShrink: 0,
  width: 200,
  height: 300,
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  // MOBILE: imagem fica full width (quase) e centralizada
  [theme.breakpoints.down("md")]: {
    width: "100%",
    maxWidth: 260,
    height: "auto",
    aspectRatio: "2 / 3",
    margin: "0 auto",
  },
}));

// Container do conteúdo (lado direito)
export const ContentContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  flex: 1,

  [theme.breakpoints.down("md")]: {
    gap: 12,
  },
}));

// Título do anime
export const AnimeTitle = styled(Typography)(({ theme }) => ({
  fontSize: 36,
  fontWeight: 700,
  color: "#fff",
  marginBottom: 8,
  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",

  [theme.breakpoints.down("md")]: {
    fontSize: 22,
    marginBottom: 4,
  },
}));

// Container da linha de informações (score, classificação, ano, etc)
export const InfoRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 8,

  [theme.breakpoints.down("md")]: {
    gap: 8,
  },
}));

// Score (nota)
export const ScoreBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  padding: "8px 16px",
  borderRadius: 8,

  [theme.breakpoints.down("md")]: {
    padding: "6px 10px",
  },
}));

export const ScoreValue = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  fontWeight: 700,
  color: "#fff",
  [theme.breakpoints.down("md")]: {
    fontSize: 18,
  },
}));

export const ScoreLabel = styled(Typography)(({ theme }) => ({
  fontSize: 10,
  fontWeight: 600,
  color: "rgba(255, 255, 255, 0.6)",
  textTransform: "uppercase",
  letterSpacing: 1,

  [theme.breakpoints.down("md")]: {
    fontSize: 9,
  },
}));

// Badge de classificação etária
export const AgeRating = styled(Box)(({ theme }) => ({
  backgroundColor: "#ff6b35",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 6,
  fontSize: 16,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 40,

  [theme.breakpoints.down("md")]: {
    padding: "6px 10px",
    fontSize: 14,
  },
}));

// Ano
export const Year = styled(Typography)(({ theme }) => ({
  fontSize: 16,
  color: "rgba(255, 255, 255, 0.9)",
  fontWeight: 500,

  [theme.breakpoints.down("md")]: {
    fontSize: 14,
  },
}));

// Separador vertical
export const Divider = styled(Box)(({ theme }) => ({
  width: 1,
  height: 24,
  backgroundColor: "rgba(255, 255, 255, 0.3)",

  [theme.breakpoints.down("md")]: {
    height: 20,
  },
}));

// Container dos gêneros/tags
export const GenresContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: 10,
  flexWrap: "wrap",

  [theme.breakpoints.down("md")]: {
    gap: 6,
  },
}));

// Chip de gênero
export const GenreChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "#fff",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  fontSize: 13,
  fontWeight: 500,
  height: 28,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  [theme.breakpoints.down("md")]: {
    fontSize: 11,
    height: 24,
  },
}));

// Sinopse/descrição (com clamp em mobile)
export const Synopsis = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isExpanded",
})<{ isExpanded?: boolean }>(({ theme, isExpanded }) => ({
  fontSize: 15,
  lineHeight: 1.7,
  color: "rgba(255, 255, 255, 0.85)",
  marginTop: 8,
  maxWidth: "90%",

  [theme.breakpoints.down("md")]: {
    maxWidth: "100%",
    fontSize: 14,

    // se não estiver expandido, limita a 3 linhas
    ...(isExpanded
      ? {}
      : {
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }),
  },
}));

// Botão "Ver mais / Ver menos"
export const SeeMoreButton = styled(Button)(({ theme }) => ({
  marginTop: 4,
  padding: 0,
  minWidth: "auto",
  color: "#ffffff",
  textTransform: "none",
  fontSize: 14,

  [theme.breakpoints.up("md")]: {
    // no desktop não precisa aparecer
    display: "none",
  },
}));

// Container do footer (favoritos, etc)
export const FooterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginTop: "auto",
  paddingTop: 16,

  [theme.breakpoints.down("md")]: {
    paddingTop: 12,
  },
}));

// Botão de favorito
export const FavoriteButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isFavorite",
})<{ isFavorite?: boolean }>(({ isFavorite }) => ({
  width: 44,
  height: 44,
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.4)",
    transform: "scale(1.05)",
  },
  "& svg": {
    fontSize: 20,
    color: isFavorite ? "#ff1744" : "#ffffff",
    transition: "color 0.2s ease-in-out",
  },
}));

// Texto de usuários favoritos
export const FavoriteText = styled(Typography)({
  fontSize: 14,
  color: "rgba(255, 255, 255, 0.7)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  "& svg": {
    fontSize: 18,
  },
});
