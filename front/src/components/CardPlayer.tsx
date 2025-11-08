import { useRef, useEffect } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import Hls from "hls.js";

interface CardPlayerProps {
  src: string;
  thumbnail: string;
  onVideoEnd?: () => void;
}

const CardPlayer = ({ src, thumbnail, onVideoEnd }: CardPlayerProps) => {
  const plyrRef = useRef<any>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = plyrRef.current?.plyr?.media;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error("HLS Error:", data);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 50;

    const setupEndedListener = () => {
      const video = plyrRef.current?.plyr?.media;

      if (video && isMounted) {
        const handleEnded = () => {
          if (onVideoEnd) {
            onVideoEnd();
          }
        };

        video.addEventListener("ended", handleEnded);

        return () => {
          video.removeEventListener("ended", handleEnded);
        };
      } else if (attempts < maxAttempts && isMounted) {
        attempts++;

        setTimeout(setupEndedListener, 100);
      } else if (attempts >= maxAttempts) {
        console.error(
          "❌ Não foi possível encontrar o elemento de vídeo após várias tentativas"
        );
      }
    };

    setupEndedListener();

    return () => {
      isMounted = false;
    };
  }, [onVideoEnd]);

  return (
    <Plyr
      ref={plyrRef}
      source={{
        type: "video",
        sources: [
          {
            src: src,
            type: "application/x-mpegURL",
          },
        ],
        poster: thumbnail,
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
          options: [0.5, 0.75, 1, 1.25, 1.5, 2],
        },
      }}
    />
  );
};

export default CardPlayer;
