import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Base from "./pages/Base";
import AnimePage from "./pages/Anime/AnimePage";
import PlayerPage from "./pages/Player/PlayerPage";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Base />}>
            <Route index element={<Home />} />
            <Route path="/a/:id" element={<AnimePage />} />
            <Route path="/watch/:IdEp" element={<PlayerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
export default App;
