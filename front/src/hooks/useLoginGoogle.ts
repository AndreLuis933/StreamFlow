import { useAuth } from "@/context/AuthContext";

export function useLoginGoogle() {
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
  return { currentUser, handleLogin, handleLogout };
}
