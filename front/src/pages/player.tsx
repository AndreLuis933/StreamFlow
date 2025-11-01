import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useMemo } from "react";

interface PlayerProps {
  titulo: string;
  ep: string;
}

const Player = ({ titulo, ep }: PlayerProps) => {
  // Evita recriar objeto a cada render; só quando a URL muda
  const videoUrl = `http://localhost:8000/video?nome=${encodeURIComponent(
    titulo
  )}&ep=${ep}`;
  const source = useMemo(
    () => ({
      type: "video",
      sources: [{ src: videoUrl, type: "video/mp4" }],
    }),
    [videoUrl]
  );


  return (
    <Plyr
      // Removido key={videoUrl} para não desmontar o componente a cada mudança
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source={source as any}
      options={{
        keyboard: { focused: true, global: true },
        ratio: "16:9",
        controls: [
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "settings",
          "fullscreen",
        ],
        settings: ["speed"],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      }}
    />
  );
};

export default Player;
