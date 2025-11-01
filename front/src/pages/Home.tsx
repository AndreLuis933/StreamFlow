import CssBaseline from "@mui/material/CssBaseline";
import { Box, Button, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Player from "./player";
import axios from "axios";

const Home = () => {
  const [titulo, setTitulo] = useState("boku-no-hero-academia-final");
  const [ep, setEp] = useState<string>("");
  const [existe, setExiste] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const verificar = async () => {
    try {
      const response = await axios.get("http://localhost:8000/status", {
        params: { nome: titulo, ep },
        validateStatus: () => true,
      });
      const ok = response.status === 200;
      setExiste(ok);
      return ok;
    } catch {
      setExiste(false);
      return false;
    }
  };

  const iniciarPolling = () => {
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(async () => {
      const ok = await verificar();
      if (ok) {
        pararPolling();
        setBaixando(false);
      }
    }, 5000);
  };

  const pararPolling = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const baixar = async () => {
    const jaExiste = await verificar();
    if (jaExiste) return;
    const resp = await axios.get("http://localhost:8000/download", {
      params: { nome: titulo, ep },
      validateStatus: (status) => status < 500,
    });

    if (resp.status === 200 || resp.status === 409) {
      iniciarPolling();
    } else {
      alert(resp.data?.detail ?? `Erro (${resp.status})`);
    }
  };

  useEffect(() => {
    pararPolling();
    setExiste(false);
    setBaixando(false);
    return () => pararPolling();
  }, [titulo, ep]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
      <CssBaseline />
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          label="Titulo"
          variant="outlined"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <TextField
          label="Ep"
          variant="outlined"
          type="number"
          value={ep}
          onChange={(e) => setEp(e.target.value)}
        />
        <Button variant="contained" onClick={baixar} disabled={baixando}>
          {baixando ? "Baixando..." : "Baixar"}
        </Button>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", mt: 2 }}>
        <Player titulo={titulo} ep={ep} />
      </Box>
    </Box>
  );
};

export default Home;
