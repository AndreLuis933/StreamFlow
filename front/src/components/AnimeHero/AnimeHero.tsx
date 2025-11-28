import React, { useState } from "react";
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
  SeeMoreButton,
} from "./AnimeHero.styles";

export interface AnimeHeroProps {
  title: string;
  posterUrl: string;
  score?: number;
  ageRating?: string | number;
  year?: string | number;
  genres?: string[];
  synopsis?: string;
  handleFavoritar: () => void;
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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleSynopsis = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <AnimeHeroContainer>
      <PosterContainer>
        <img src={posterUrl} alt={title} />
      </PosterContainer>

      <ContentContainer>
        <AnimeTitle>{title}</AnimeTitle>

        <InfoRow>
          {/* Score */}
          {typeof score === "number" && (
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
        {synopsis && (
          <>
            <Synopsis isExpanded={isExpanded}>{synopsis}</Synopsis>
            <SeeMoreButton onClick={handleToggleSynopsis}>
              {isExpanded ? "Ver menos" : "Ver mais"}
            </SeeMoreButton>
          </>
        )}

        {/* Footer com favoritos */}
        <FooterContainer>
          <FavoriteButton onClick={handleFavoritar} isFavorite={isFavorite}>
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </FavoriteButton>
        </FooterContainer>
      </ContentContainer>
    </AnimeHeroContainer>
  );
};

export default AnimeHero;
