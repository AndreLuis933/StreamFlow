import { styled as muiStyled } from "@mui/material/styles";
import { Box } from "@mui/material";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";

export const PlayerContainer = muiStyled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 960,
  marginInline: "auto",
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

export const BackButton = muiStyled(Button)(({ theme }) => ({
  position: "absolute",
  top: 8,
  left: 8,
  zIndex: 10,

  [theme.breakpoints.up("md")]: {
    top: 24,
    left: 24,
  },


  width: 160,
  height: 48,
  minWidth: 160,
  padding: 0,

  backgroundColor: "#1b7f3b",
  color: "#ffffff",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.7)",
  textTransform: "none",
  fontWeight: 600,
  justifyContent: "center",
  boxShadow: "none",

  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1),
  },

  "&:hover": {
    backgroundColor: "#176b32",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.5)",
  },
}));
