// components/EpNavButtons.tsx
import React from "react";
import styled from "styled-components";
import { ButtonBase, Box, Typography, Avatar } from "@mui/material";

type EpButtonProps = {
  label: string; // "Anterior" | "Próximo"
  epNumber: number | string; // 1146, 1148...
  thumbUrl: string; // URL da imagem/thumbnail
  $align?: "left" | "right"; // posicionamento do conteúdo
  onClick?: () => void;
};

const CardButton = styled(ButtonBase)`
  width: 100%;
  height: 84px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  text-align: left;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 12px 16px;
  transition: transform 120ms ease, background 120ms ease, border 120ms ease;
  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

const BgArt = styled.div<{ $image: string; $align: "left" | "right" }>`
  position: absolute;
  inset: 0;
  background-image: ${({ $image }) => `url(${$image})`};
  background-size: cover;
  background-position: ${({ $align }) =>
    $align === "left" ? "left center" : "right center"};
  opacity: 0.18; /* bem sutil como no print */
  filter: saturate(0.9) brightness(0.9);
  pointer-events: none;
`;

const Fade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(18, 18, 18, 0.9),
    rgba(18, 18, 18, 0.4),
    rgba(18, 18, 18, 0.9)
  );
  pointer-events: none;
`;

const Content = styled(Box)<{ $align: "left" | "right" }>`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  height: 100%;
  justify-content: ${({ $align }) =>
    $align === "left" ? "flex-start" : "flex-end"};
  text-align: ${({ $align }) => ($align === "left" ? "left" : "right")};
  width: 100%;
`;

export const EpNavButton: React.FC<EpButtonProps> = ({
  label,
  epNumber,
  thumbUrl,
  $align = "left",
  onClick,
}) => (
  <CardButton onClick={onClick} focusRipple>
    <BgArt $image={thumbUrl} $align={$align} />
    <Fade />
    <Content $align={$align}>
      {$align === "left" && (
        <>
          <Box>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Episódio <b>{epNumber}</b>
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              {label}
            </Typography>
          </Box>
          <Avatar
            src={thumbUrl}
            alt={`Ep ${epNumber}`}
            sx={{
              width: 46,
              height: 46,
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
        </>
      )}
      {$align === "right" && (
        <>
          <Avatar
            src={thumbUrl}
            alt={`Ep ${epNumber}`}
            sx={{
              width: 46,
              height: 46,
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
          <Box>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              Episódio <b>{epNumber}</b>
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              {label}
            </Typography>
          </Box>
        </>
      )}
    </Content>
  </CardButton>
);
