import { BrowserRouter, Route, Routes } from "react-router-dom";
import Favorito from "./pages/Favoritos/Favorito";
import Base from "./pages/Base";
import SeriePage from "./pages/Serie/SeriePage";
import PlayerPage from "./pages/Player/PlayerPage";
import Movie from "./pages/Movie/Movie";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Home from "./pages/Home/Home";

const App = () => {
  const isProd = process.env.NODE_ENV === "production";
  return (
    <>
      <BrowserRouter>
        {isProd && <Analytics />}
        {isProd && <SpeedInsights />}
        <Routes>
          <Route path="/" element={<Base />}>
            <Route index element={<Home />} />
            <Route path="/serie/:id" element={<SeriePage />} />
            <Route path="/f/:id" element={<Movie />} />
            <Route path="/watch/:IdEp" element={<PlayerPage />} />
            <Route path="/favoritos" element={<Favorito />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
export default App;
