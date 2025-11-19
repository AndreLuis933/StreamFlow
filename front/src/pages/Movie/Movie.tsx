import CardPlayer from "@/components/CardPlayer/CardPlayer";
import { getFilmeImageUrlBySlug } from "@/utils/images";
import { Page } from "../Base";
import { Alert, Box, Skeleton } from "@mui/material";
import { useParams } from "react-router-dom";
import { useMovieData } from "./Movie.hooks";
const VITE_API_BASE_URL_PROXY = import.meta.env.VITE_API_BASE_URL_PROXY;
type RouteParams = { id: string };

const Movie = () => {
  const { id } = useParams<RouteParams>();

  if (!id) {
    return (
      <Page>
        <Alert severity="warning">Parâmetros inválidos na URL.</Alert>
      </Page>
    );
  }
  const { data, isLoading, error } = useMovieData(id);
  if (!data) {
    return <></>;
  }
  const thumb = getFilmeImageUrlBySlug(data.data_movie.slug_filme);
  const src = `${VITE_API_BASE_URL_PROXY}/m3u8?nome=${encodeURIComponent(
    data.data_movie.slug_filme
  )}&is_movie=true`;
  return (
    <Page>
      {isLoading ? (
        <Skeleton variant="rounded" height={540} />
      ) : error ? (
        <Alert severity="error">Falha ao carregar detalhes.</Alert>
      ) : (
        <Box>
          <CardPlayer
            thumbnail={thumb}
            videoId={id}
            nome={data.data_movie.slug_filme}
            src={src}
            onVideoEnd={() => {}}
          />

        </Box>
      )}
    </Page>
  );
};

export default Movie;
