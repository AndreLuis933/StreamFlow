import React from "react";
import { useAuth } from "../context/AuthContext";


const Login: React.FC = () => {
  const { loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Erro ao logar:", err);
      alert("Falha no login");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 50 }}>
      <h2>Faça login</h2>
      <button
        onClick={handleLogin}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        🔐 Entrar com Google
      </button>
    </div>
  );
};

export default Login;
