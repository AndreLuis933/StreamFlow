import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { Outlet } from "react-router-dom";

const Base = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
      <CssBaseline />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Base;
