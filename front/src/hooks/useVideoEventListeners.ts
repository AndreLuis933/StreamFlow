// hooks/useVideoEventListeners.ts
import { useEffect } from "react";

interface UseVideoEventListenersProps {
  plyrRef: React.MutableRefObject<any>;
  videoId: string;
  onVideoEnd: () => void;
  saveProgress: (currentTime: number) => void;
  clearProgress: () => void;
  restoreProgress: (video: HTMLVideoElement) => void;
}

export const useVideoEventListeners = ({
  plyrRef,
  videoId,
  onVideoEnd,
  saveProgress,
  clearProgress,
  restoreProgress,
}: UseVideoEventListenersProps) => {
  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 50;
    let saveInterval: NodeJS.Timeout;

    const setupListeners = () => {
      const video = plyrRef.current?.plyr?.media;

      if (video && isMounted) {
        // Restauraçao de progress
        const handleLoadedMetadata = () => {
          restoreProgress(video);
        };

        // Fallback de restauraçao
        const handleCanPlay = () => {
          restoreProgress(video);
        };

        // Iniciar salvamento periódico do progresso
        const startSaving = () => {
          // Usar intervalo ao invés de timeupdate para melhor performance
          saveInterval = setInterval(() => {
            if (!video.paused && !video.ended && video.currentTime > 0) {
              saveProgress(video.currentTime);
            }
          }, 2000);
        };

        // Salvar progresso quando o usuário pausar
        const handlePause = () => {
          if (video.currentTime > 0) {
            saveProgress(video.currentTime);
          }
        };

        // pular ep
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key.toLowerCase() === "n") {
            const isFullscreen =
              document.fullscreenElement ||
              (document as any).webkitFullscreenElement ||
              (document as any).mozFullScreenElement ||
              (document as any).msFullscreenElement;

            if (isFullscreen) {
              onVideoEnd();
            }
          }
        };

        window.addEventListener("keydown", handleKeyDown);

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("play", startSaving);
        video.addEventListener("pause", handlePause);

        return () => {
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("pause", handlePause);
          video.removeEventListener("play", startSaving);

          window.removeEventListener("keydown", handleKeyDown);
          if (saveInterval) clearInterval(saveInterval);
        };
      } else if (attempts < maxAttempts && isMounted) {
        // Retry logic para garantir que os listeners sejam configurados
        attempts++;
        setTimeout(setupListeners, 100);
      }
    };

    setupListeners();

    return () => {
      // Prevenir memory leaks e operações após unmount
      isMounted = false;
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [
    onVideoEnd,
    videoId,
    plyrRef,
    saveProgress,
    clearProgress,
    restoreProgress,
  ]);
};
