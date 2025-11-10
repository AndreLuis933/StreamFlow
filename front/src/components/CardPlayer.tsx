// CardPlayer.tsx
import { useRef, useEffect, useCallback } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useHlsPlayer } from "@/hooks/useHlsPlayer";
import { useVideoEventListeners } from "@/hooks/useVideoEventListeners";

interface CardPlayerProps {
  src: string;
  thumbnail: string;
  videoId: string;
  onVideoEnd: () => void;
}

const CardPlayer = ({
  src,
  thumbnail,
  videoId,
  onVideoEnd,
}: CardPlayerProps) => {
  const plyrRef = useRef<any>(null);

  // Gerenciar o progresso do vídeo no localStorage
  const { saveProgress, getProgress, clearProgress, hasRestoredProgress } =
    useVideoProgress(videoId);

  // Restaurar o progresso salvo, evitando restaurar múltiplas vezes
  const restoreProgress = useCallback(
    (video: HTMLVideoElement) => {
      if (hasRestoredProgress.current) return;

      const savedTime = getProgress();
      // Restaurar apenas se houver progresso salvo
      if (savedTime > 0 && video.duration) {
        video.currentTime = savedTime;
        hasRestoredProgress.current = true;
      }
    },
    [getProgress, hasRestoredProgress]
  );

  // Configurar HLS player
  useHlsPlayer({
    src,
    videoId,
    plyrRef,
    onManifestParsed: restoreProgress,
  });

  // Configurar event listeners do vídeo
  useVideoEventListeners({
    plyrRef,
    videoId,
    onVideoEnd,
    saveProgress,
    clearProgress,
    restoreProgress,
  });

  // Resetar flag de restauração quando trocar de vídeo
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
