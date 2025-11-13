import { useRef, useEffect, useCallback } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useHlsPlayer } from "@/hooks/useHlsPlayer";

import "./button.css";
import { useVideoEventListeners } from "@/hooks/useVideoEventListeners";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface CardPlayerProps {
  thumbnail: string;
  videoId: string;
  onVideoEnd: () => void;
  nome: string;
  ep: string;
}

const CardPlayer = ({
  thumbnail,
  videoId,
  onVideoEnd,
  nome,
  ep,
}: CardPlayerProps) => {
  const plyrRef = useRef<any>(null);
  const src = `${API_BASE}/m3u8?nome=${encodeURIComponent(
    nome
  )}&ep=${encodeURIComponent(ep)}`;

  const { saveProgress, getProgress, clearProgress, hasRestoredProgress } =
    useVideoProgress(videoId);

  const restoreProgress = useCallback(
    (video: HTMLVideoElement) => {
      if (hasRestoredProgress.current) return;

      const savedTime = getProgress();
      if (savedTime > 0 && video.duration) {
        video.currentTime = savedTime;
        hasRestoredProgress.current = true;
      }
    },
    [getProgress, hasRestoredProgress]
  );

  useHlsPlayer({
    src,
    videoId,
    plyrRef,
    onManifestParsed: restoreProgress,
  });

  useVideoEventListeners({
    plyrRef,
    videoId,
    onVideoEnd,
    saveProgress,
    clearProgress,
    restoreProgress,
    nome,
    ep,
  });

  useEffect(() => {
    hasRestoredProgress.current = false;
  }, [videoId]);

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
