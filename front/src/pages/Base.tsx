import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Header from "@/components/Header/Header";

export const Page = styled(Box)(() => ({
  position: "relative",
  padding: "1.5rem",
  background: "#1b1b1a",
  borderRadius: 10,
  height: "100%",
}));

const Base = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flex: 1,
        }}
      >
        <Header />
        <Page>
          <Outlet />
        </Page>
      </Box>
    </Box>
  );
};

export default Base;
