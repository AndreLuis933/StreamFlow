import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { Outlet } from "react-router-dom";
import { styled } from "@mui/material/styles";

export const Page = styled(Box)(() => ({
  padding: 24,
  background: "#000",
  minHeight: "100vh",
  borderRadius: 10,
  flexGrow: 1,
}));

const Base = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
      <CssBaseline />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Page>
          <Outlet />
        </Page>
      </Box>
    </Box>
  );
};

export default Base;
