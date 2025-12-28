import { EpisodesSection, SectionTitle } from "@/components/EpisodesSection";
import { CardContent, Grid, Skeleton, Typography } from "@mui/material";
import { useHome } from "./Home.hooks";
import * as S from "@/components/CardSerie";
import { getSerieImageUrlBySlug } from "@/utils/images";

export default function Home() {
  const { episodes, navigate } = useHome();
  return (
    <EpisodesSection>
      <SectionTitle>Biblioteca</SectionTitle>
      <Grid container spacing={2}>
        {episodes.map((serie) => (
          <Grid key={serie.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <S.SerieCard>
              <S.SerieActionArea onClick={() => navigate(`/serie/${serie.title}`)}>
                <S.SerieCover
                  component="img"
                  image={getSerieImageUrlBySlug(serie.title)}
                  alt={serie.title}
                />
                <CardContent sx={{ p: 1.5, width: "100%" }}>
                  <S.SerieTitle variant="subtitle2">{serie.title}</S.SerieTitle>
                </CardContent>
              </S.SerieActionArea>
            </S.SerieCard>
          </Grid>
        ))}
      </Grid>
    </EpisodesSection>
  );
}
