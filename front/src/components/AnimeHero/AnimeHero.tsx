import React from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {
  AnimeHeroContainer,
  PosterContainer,
  ContentContainer,
  AnimeTitle,
  InfoRow,
  ScoreBox,
  ScoreValue,
  ScoreLabel,
  AgeRating,
  Year,
  Divider,
  GenresContainer,
  GenreChip,
  Synopsis,
  FooterContainer,
  FavoriteButton,

} from "./AnimeHero.styles";


export interface AnimeHeroProps {
  title: string;
  posterUrl: string;
  score?: number;
  ageRating?: string | number;
  year?: string | number;
  genres?: string[];
  synopsis?: string;
  handleFavoritar: ()=>void;
  isFavorite: boolean;
}

const AnimeHero: React.FC<AnimeHeroProps> = ({
  title,
  posterUrl,
  score,
  ageRating,
  year,
  genres = [],
  synopsis,
  handleFavoritar,
  isFavorite,
}) => {
  return (
    <AnimeHeroContainer>
      <PosterContainer>
        <img src={posterUrl} alt={title} />
      </PosterContainer>

      <ContentContainer>
        <AnimeTitle>{title}</AnimeTitle>

        <InfoRow>
          {/* Score */}
          {score && (
            <>
              <ScoreBox>
                <ScoreValue>{score.toFixed(1)}</ScoreValue>
                <ScoreLabel>SCORE</ScoreLabel>
              </ScoreBox>
              <Divider />
            </>
          )}

          {/* Classificação etária */}
          {ageRating && (
            <>
              <AgeRating>{ageRating}</AgeRating>
              <Divider />
            </>
          )}

          {/* Ano */}
          {year && (
            <>
              <Year>{year}</Year>
              <Divider />
            </>
          )}

          {/* Gêneros */}
          {genres.length > 0 && (
            <GenresContainer>
              {genres.map((genre) => (
                <GenreChip key={genre} label={genre} />
              ))}
            </GenresContainer>
          )}
        </InfoRow>

        {/* Sinopse */}
        {synopsis && <Synopsis>{synopsis}</Synopsis>}

        {/* Footer com favoritos */}

        <FooterContainer>
          <FavoriteButton onClick={handleFavoritar} isFavorite={isFavorite}>
            {isFavorite ? (
              // Se for favorito: Ícone Cheio (a cor vermelha vem do styled component)
              <FavoriteIcon />
            ) : (
              // Se NÃO for favorito: Ícone de Borda (a cor branca vem do styled component)
              <FavoriteBorderIcon />
            )}
          </FavoriteButton>
        </FooterContainer>
      </ContentContainer>
    </AnimeHeroContainer>
  );
};

export default AnimeHero;
