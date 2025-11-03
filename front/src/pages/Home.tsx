import CssBaseline from "@mui/material/CssBaseline";
import { Box, TextField } from "@mui/material";
import { useState } from "react";
import VideoPlayer from "./player";

const Home = () => {
  const [titulo, setTitulo] = useState("boku-no-hero-academia-final");
  const [ep, setEp] = useState<string>("1");

  const m3u8Url = `http://localhost:8000/m3u8?nome=${encodeURIComponent(
    titulo
  )}&ep=${encodeURIComponent(ep)}`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
      <CssBaseline />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <TextField
          label="Título"
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
          sx={{ width: 160 }}
        />
      </Box>

      <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", mt: 2 }}>
        <VideoPlayer src={m3u8Url} />
      </Box>
    </Box>
  );
};

export default Home;
