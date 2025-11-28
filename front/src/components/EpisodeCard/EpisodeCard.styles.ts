import { Link } from "react-router-dom";
import styled from "styled-components";
import { Box, Typography } from "@mui/material";

export const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  width: 100%;
  /* Remove altura fixa, deixa o card crescer conforme o conteúdo */
  /* height: 180px; */
  &:hover {
    transform: scale(1.02);
  }
`;

/**
 * Mantém 16:9 SEM cortar:
 * - Usa aspect-ratio: 16 / 9
 * - Usa object-fit: contain pra mostrar a imagem inteira
 * - background preto pra não ficar estranho se sobrar espaço
 */
export const Image = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain; /* mostra a imagem inteira, sem corte */
  background: #000; /* bordas laterais ou em cima/baixo se sobrar espaço */
  flex-shrink: 0;
`;

export const Info = styled(Box)`
  padding: 10px;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-height: 0;
`;

export const Number = styled(Typography)`
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  span {
    color: #ff8c00;
  }
`;

export const Title = styled(Typography)`
  color: #999;
  font-size: 12px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;