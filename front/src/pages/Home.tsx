import CssBaseline from "@mui/material/CssBaseline";
import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import Player from "./player";
import axios from "axios";

const Home = () => {
  const [titulo, setTitulo] = useState("boku-no-hero-academia-final");
  const [ep, setEp] = useState(1);

  const baixar = async () => {
    const response = await axios({
      method: "GET",
      url: "http://localhost:8000/download",
      params: { nome: titulo, ep: ep },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "10px",
      }}
    >
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <TextField
          id="outlined-basic"
          label="Titulo"
          variant="outlined"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <TextField
          id="outlined-basic"
          label="Ep"
          variant="outlined"
          value={ep}
          onChange={(e) => setEp(Number(e.target.value))}
        />
        <Button variant="contained" onClick={(_) => baixar()}>
          Contained
        </Button>
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: 960,
          mx: "auto",
        }}
      >
        <Player />
      </Box>
    </Box>
  );
};

export default Home;
