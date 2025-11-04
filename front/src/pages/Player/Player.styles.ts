import { styled as muiStyled } from "@mui/material/styles";
import { Box } from "@mui/material";
import styled from "styled-components";
import { Link } from "react-router-dom";

export const Page = muiStyled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 960,
  marginInline: "auto",
  marginTop: theme.spacing(2),
  paddingInline: theme.spacing(2),
}));

export const TitleLink = styled(Link)`
  color: #ff4500;
  font-size: 24px;
  font-weight: bold;
  padding: 0 8px 8px 0;
  text-decoration: none;
  display: inline-block;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    color: #ff5722;
  }
`;