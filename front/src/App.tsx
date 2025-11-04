import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Base from "./pages/Base";
import Anime from "./pages/Anime";
import VideoPlayer from "./pages/Player";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Base />}>
            <Route index element={<Home />} />
            <Route path="/a/:id" element={<Anime />} />
            <Route path="/watch/:id" element={<VideoPlayer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
export default App;
