import { styled, alpha } from "@mui/material/styles";
import { AppBar, Toolbar, InputBase, Button } from "@mui/material";
import { Link } from "react-router-dom";

const colors = {
  background: "#0a0a0a",
  primary: "#ff6b00",
  text: "#ffffff",
  textMuted: "#cccccc",
  searchBg: "#1f1f1f",
  dropdownBg: "#1e1e1e",
  dropdownBorder: "#2a2a2a",
};

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  minHeight: "64px",
  padding: "0 16px",
  gap: "8px",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: "8px 12px",
  },
}));

export const LeftSection = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "20px",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "space-between",
  },
}));

export const RightSection = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    marginTop: "8px",
    justifyContent: "center",
  },
}));

export const LogoText = styled(Link)({
  fontSize: "24px",
  fontWeight: 800,
  letterSpacing: "-0.5px",
  color: colors.text,
  textDecoration: "none",
  cursor: "pointer",
  "& span": {
    color: colors.primary,
  },
});


export const LoginButton = styled(Button)({
  color: colors.text,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "15px",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

export const LogoutButton = styled(Button)({
  color: colors.primary,
  borderColor: colors.primary,
  textTransform: "none",
  fontWeight: 600,
  "&:hover": {
    borderColor: alpha(colors.primary, 0.8),
    backgroundColor: alpha(colors.primary, 0.08),
  },
});

export const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "4px",
  backgroundColor: colors.searchBg,
  "&:hover": {
    backgroundColor: alpha(colors.searchBg, 0.8),
  },
  marginRight: theme.spacing(1),
  marginLeft: 0,
  width: "100%",
  display: "flex",
  alignItems: "center",

  [theme.breakpoints.down("sm")]: {
    marginRight: 0,
  },

  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
    minWidth: "300px",
  },
}));

export const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: colors.textMuted,
  zIndex: 1,
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: colors.text,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: "14px",
  },
}));

// --- Dropdown de Resultados (FloatCard) ---
export const FloatCard = styled("div", {
  shouldForwardProp: (prop) => prop !== "$show",
})<{ $show: boolean }>(({ $show }) => ({
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  width: "100%",
  backgroundColor: colors.dropdownBg,
  border: `1px solid ${colors.dropdownBorder}`,
  borderRadius: "10px",
  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.4)",
  padding: "8px 0",
  maxHeight: "400px",
  overflowY: "auto",
  zIndex: 1000,
  display: $show ? "block" : "none",


  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#333",
    borderRadius: "3px",
  },
}));

export const ResultItem = styled("a")({
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  textDecoration: "none",
  color: "#eaeaea",
  padding: "10px 12px",
  fontSize: "14px",
  transition: "background 0.2s",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

export const ResultCover = styled("img")({
  width: "60px",
  height: "90px",
  borderRadius: "4px",
  objectFit: "cover",
  flexShrink: 0,
});

export const ResultInfo = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});

export const ResultTitle = styled("span")({
  fontWeight: 600,
  fontSize: "14px",
  lineHeight: 1.2,
  color: "#fff",
});

export const ResultSynopsis = styled("p")({
  margin: 0,
  color: "#bdbdbd",
  fontSize: "12px",
  lineHeight: 1.35,
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});
