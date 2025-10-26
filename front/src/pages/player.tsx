import Plyr from "plyr-react";
import "plyr-react/plyr.css";

const Player = () => {
  return (
    <Plyr
      source={{
        type: "video",
        sources: [
          {
            src: "http://localhost:8000/video",
            type: "video/mp4",
          },
        ],
      }}
      options={{
        keyboard: {
          focused: true,
          global: true,
        },
        seekTime: 10,
        tooltips: { controls: true, seek: true },
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
        speed: {
          selected: 1,
          options: [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3],
        },
      }}
    />
  );
};

export default Player;
