import React from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
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
  FavoriteText,
} from "./AnimeHero.styles";

export interface AnimeHeroProps {
  title: string;
  posterUrl: string;
  score?: number;
  ageRating?: string | number;
  year?: string | number;
  genres?: string[];
  synopsis?: string;
  favoriteCount?: number;
}

const AnimeHero: React.FC<AnimeHeroProps> = ({
  title,
  posterUrl,
  score,
  ageRating,
  year,
  genres = [],
  synopsis,
  favoriteCount,
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
        {favoriteCount !== undefined && (
          <FooterContainer>
            <FavoriteButton>
              <FavoriteIcon />
            </FavoriteButton>
            <FavoriteText>
              <PersonIcon />
              {favoriteCount.toLocaleString()} usuários têm esse anime como
              favorito.
            </FavoriteText>
          </FooterContainer>
        )}
      </ContentContainer>
    </AnimeHeroContainer>
  );
};

export default AnimeHero;
