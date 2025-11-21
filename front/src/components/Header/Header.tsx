import { IconButton } from "@mui/material";
import { Home, Logout, Login } from "@mui/icons-material";
import * as S from "./Header.styles";
import SearchComponent from "./Search/SearchField";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { currentUser, loginWithGoogle, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Erro ao logar:", err);
      alert("Falha no login");
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Erro ao logout:", err);
      alert("Falha no logout");
    }
  };
  return (
    <S.StyledAppBar>
      <S.StyledToolbar>
        {/* Lado Esquerdo: Logo + Home */}
        <S.LeftSection>
          <S.LogoText>
            <span>an</span>rol
          </S.LogoText>

          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            aria-label="home"
            component={Link}
            to="/"
          >
            <Home />
          </IconButton>
        </S.LeftSection>

        {/* Lado Direito: Pesquisa + Login/Logout */}
        <S.RightSection>
          {/* Componente de Busca com Lógica Integrada */}
          <SearchComponent />

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
        </S.RightSection>
      </S.StyledToolbar>
    </S.StyledAppBar>
  );
};

export default Header;
