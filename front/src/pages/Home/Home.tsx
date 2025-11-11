// src/pages/AnimePage/AnimePage.tsx
import { Grid, Box, Skeleton } from "@mui/material";
import SearchTextField from "@/components/SearchTextField";
import EpisodeCard from "@/components/EpisodeCard/EpisodeCard";

import { EpisodesSection, Page, SectionTitle } from "../Anime/Anime.styles";
import { useEpisodesFetcher } from "@/hooks/useEpisodesFetcher";

const slugs = [
  "pI5rxkNCCk",
  "GTv9jbBjLa",
  "AdGDtLfuNz",
  "zUtyLxRuCe",
  "00jc8vcBDP",
];
export default function Home() {
  const { episodes, loading } = useEpisodesFetcher({ slugs });

  return (
    <Page>
      <Box sx={{ p: 4 }}>
        <SearchTextField />
      </Box>

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
    </Page>
  );
}
