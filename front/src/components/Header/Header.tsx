// Header.tsx
import { Box, IconButton } from "@mui/material";
import { Home, Logout, Login } from "@mui/icons-material";
import * as S from "./Header.styles";
import SearchComponent from "./Search/SearchField";
import { Link } from "react-router-dom";
import { useLoginGoogle } from "@/hooks/useLoginGoogle";

interface ButtonLoginProps {
  mobile?: boolean;
  currentUser: any; // tipa com o tipo certo se você tiver
  handleLogout: () => void;
  handleLogin: () => void;
}

const ButtonLogin = ({
  mobile,
  currentUser,
  handleLogout,
  handleLogin,
}: ButtonLoginProps) => {
  const xs = mobile ? "block" : "none";
  const md = mobile ? "none" : "block";

  return (
    <Box sx={{ display: { xs, md }, marginLeft: "auto" }}>
      {currentUser ? (
        <S.LogoutButton
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Sair
        </S.LogoutButton>
      ) : (
        <S.LoginButton startIcon={<Login />} onClick={handleLogin}>
          Login
        </S.LoginButton>
      )}
    </Box>
  );
};

const Header = () => {
  const { currentUser, handleLogout, handleLogin } = useLoginGoogle();

  return (
    <S.StyledToolbar>
      <S.LeftSection>
        <S.LogoText to="/">
          <span>an</span>rol
        </S.LogoText>

        <IconButton
          size="small"
          sx={{
            color: "#fff",
            display: { xs: "none", sm: "inline-flex" },
          }}
          aria-label="home"
          component={Link}
          to="/"
        >
          <Home />
        </IconButton>

        <ButtonLogin
          mobile
          currentUser={currentUser}
          handleLogout={handleLogout}
          handleLogin={handleLogin}
        />
      </S.LeftSection>

      <S.RightSection>
        <SearchComponent />
        <ButtonLogin
          currentUser={currentUser}
          handleLogout={handleLogout}
          handleLogin={handleLogin}
        />
      </S.RightSection>
    </S.StyledToolbar>
  );
};

export default Header;
