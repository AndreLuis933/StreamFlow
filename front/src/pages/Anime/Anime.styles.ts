import { Box, Typography, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Page = styled(Box)(({ theme }) => ({
  padding: 24,
  background: "#000",
  minHeight: "100vh",
  borderRadius: 10,
}));

// Container principal do card de anime (hero/capa)
export const AnimeHero = styled(Box)(({ theme }) => ({
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
}));

// Container da imagem do poster
export const PosterContainer = styled(Box)({
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
});

// Container do conteúdo (lado direito)
export const ContentContainer = styled(Box)({
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  flex: 1,
});

// Título do anime
export const AnimeTitle = styled(Typography)({
  fontSize: 36,
  fontWeight: 700,
  color: "#fff",
  marginBottom: 8,
  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
});

// Container da linha de informações (score, classificação, ano, etc)
export const InfoRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 8,
});

// Score (nota)
export const ScoreBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  padding: "8px 16px",
  borderRadius: 8,
});

export const ScoreValue = styled(Typography)({
  fontSize: 24,
  fontWeight: 700,
  color: "#fff",
});

export const ScoreLabel = styled(Typography)({
  fontSize: 10,
  fontWeight: 600,
  color: "rgba(255, 255, 255, 0.6)",
  textTransform: "uppercase",
  letterSpacing: 1,
});

// Badge de classificação etária
export const AgeRating = styled(Box)({
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
});

// Ano
export const Year = styled(Typography)({
  fontSize: 16,
  color: "rgba(255, 255, 255, 0.9)",
  fontWeight: 500,
});

// Separador vertical
export const Divider = styled(Box)({
  width: 1,
  height: 24,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
});

// Container dos gêneros/tags
export const GenresContainer = styled(Box)({
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
});

// Chip de gênero
export const GenreChip = styled(Chip)({
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
});

// Sinopse/descrição
export const Synopsis = styled(Typography)({
  fontSize: 15,
  lineHeight: 1.7,
  color: "rgba(255, 255, 255, 0.85)",
  marginTop: 8,
  maxWidth: "90%",
});

// Container do footer (favoritos, etc)
export const FooterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginTop: "auto",
  paddingTop: 16,
});

// Botão de favorito
export const FavoriteButton = styled(Box)({
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
    color: "rgba(255, 255, 255, 0.7)",
  },
});

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

// Container da seção de episódios
export const EpisodesSection = styled(Box)({
  marginTop: 32,
});

export const SectionTitle = styled(Typography)({
  fontSize: 24,
  fontWeight: 700,
  color: "#fff",
  marginBottom: 24,
});
