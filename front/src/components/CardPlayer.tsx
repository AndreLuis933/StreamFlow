import { useRef, useEffect } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import Hls from "hls.js";

interface CardPlayerProps {
  src: string;
  thumbnail: string;
  videoId: string;
  onVideoEnd?: () => void;
}

const CardPlayer = ({
  src,
  thumbnail,
  videoId,
  onVideoEnd,
}: CardPlayerProps) => {
  const plyrRef = useRef<any>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hasRestoredProgress = useRef(false);
  const STORAGE_KEY = `video-progress-${videoId}`;

  const saveProgress = (currentTime: number) => {
    localStorage.setItem(STORAGE_KEY, currentTime.toString());
    console.log(`💾 Salvando progresso: ${currentTime}s`);
  };

  const getProgress = (): number => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const progress = saved ? parseFloat(saved) : 0;
    console.log(`📖 Progresso recuperado: ${progress}s`);
    return progress;
  };

  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log(`🗑️ Progresso limpo`);
  };

  // Função para restaurar o progresso
  const restoreProgress = (video: HTMLVideoElement) => {
    if (hasRestoredProgress.current) return;

    const savedTime = getProgress();
    if (savedTime > 0 && video.duration && savedTime < video.duration - 5) {
      console.log(`⏩ Restaurando para: ${savedTime}s`);
      video.currentTime = savedTime;
      hasRestoredProgress.current = true;
    }
  };

  useEffect(() => {
    const video = plyrRef.current?.plyr?.media;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      // Restaurar progresso quando o HLS estiver pronto
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ HLS Manifest carregado");
        setTimeout(() => restoreProgress(video), 100);
      });

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
  }, [src, videoId]);

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 50;
    let saveInterval: NodeJS.Timeout;

    const setupListeners = () => {
      const video = plyrRef.current?.plyr?.media;

      if (video && isMounted) {
        // Tentar restaurar quando metadata estiver carregada
        const handleLoadedMetadata = () => {
          console.log("📺 Metadata carregada, duração:", video.duration);
          restoreProgress(video);
        };

        // Tentar restaurar quando puder reproduzir
        const handleCanPlay = () => {
          console.log("▶️ Vídeo pronto para reproduzir");
          restoreProgress(video);
        };

        // Salvar progresso a cada 2 segundos (mais eficiente que timeupdate)
        const startSaving = () => {
          saveInterval = setInterval(() => {
            if (!video.paused && !video.ended && video.currentTime > 0) {
              saveProgress(video.currentTime);
            }
          }, 2000);
        };

        const handleEnded = () => {
          clearProgress();
          if (onVideoEnd) {
            onVideoEnd();
          }
        };

        // Salvar ao pausar também
        const handlePause = () => {
          if (video.currentTime > 0) {
            saveProgress(video.currentTime);
          }
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("ended", handleEnded);
        video.addEventListener("pause", handlePause);
        video.addEventListener("play", startSaving);

        // Tentar restaurar imediatamente se já tiver duração
        if (video.duration && video.duration > 0) {
          restoreProgress(video);
        }

        return () => {
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("ended", handleEnded);
          video.removeEventListener("pause", handlePause);
          video.removeEventListener("play", startSaving);
          if (saveInterval) clearInterval(saveInterval);
        };
      } else if (attempts < maxAttempts && isMounted) {
        attempts++;
        setTimeout(setupListeners, 100);
      }
    };

    setupListeners();

    return () => {
      isMounted = false;
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [onVideoEnd, videoId]);

  // Reset do flag quando mudar de vídeo
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
