import { useRef, useEffect, useCallback } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { setupHlsPlayer } from "@/hooks/setupHlsPlayer";
import { fetchIntroDuration, fetchCreditsDuration } from "@/services/serie";
import "./button.css";
import { waitForPlayer } from "@/utils/waitForPlayer";
import { attachKeyboardListeners } from "@/hooks/listeners/keyboardListeners";
import { attachIntroButton } from "@/hooks/listeners/introButtonListeners";
import { attachCreditsButton } from "@/hooks/listeners/creditsButtonListeners";
import { attachVideoListeners } from "@/hooks/listeners/videoListeners";
import { plyrOptions } from "@/consts/const";
import { attachFullscreenOrientation } from "@/hooks/listeners/fullscreenOrientationListener";

interface CardPlayerProps {
  thumbnail: string;
  videoId: string;
  onVideoEnd: () => void;
  nome: string;
  ep?: string;
  src: string;
}

const CardPlayer = ({
  thumbnail,
  videoId,
  onVideoEnd,
  nome,
  ep,
  src,
}: CardPlayerProps) => {
  const plyrRef = useRef<any>(null);

  const introButtonRef = useRef<HTMLButtonElement | null>(null);
  const introDurationRef = useRef<{
    start_sec: number;
    end_sec: number;
  } | null>(null);
  const creditsButtonRef = useRef<HTMLButtonElement | null>(null);
  const creditsDurationRef = useRef<{
    start_sec: number;
    end_sec: number;
  } | null>(null);

  const { getProgress, hasRestoredProgress, saveProgress } =
    useVideoProgress(videoId);

  useEffect(() => {
    hasRestoredProgress.current = false;
  }, [videoId, hasRestoredProgress]);

  const restoreProgress = useCallback(
    (video: HTMLVideoElement) => {
      if (hasRestoredProgress.current) return;
      const savedTime = getProgress();
      if (savedTime > 0) {
        video.currentTime = savedTime;
        hasRestoredProgress.current = true;
      }
    },
    [getProgress, hasRestoredProgress]
  );

  useEffect(() => {
    return waitForPlayer(plyrRef, (player, video) => {
      // 1. Configurar HLS
      const cleanupHls = setupHlsPlayer({ src, video });

      // 2. Listeners de Vídeo (Progresso, Save/Restore)
      const cleanupVideoListeners = attachVideoListeners({
        video,
        saveProgress,
        restoreProgress,
      });

      // 3. Listeners de Teclado
      const cleanupKeyboard = attachKeyboardListeners({ onVideoEnd });

      // 4. Botão de Intro
      let cleanupIntro: (() => void) | undefined;
      if (ep) {
        cleanupIntro = attachIntroButton({
          player,
          video,
          fetchIntroDuration,
          nome,
          ep,
          introButtonRef,
          introDurationRef,
        });
      }

      // 5. Botão de Créditos
      let cleanupCredits: (() => void) | undefined;
      let creditsTimeoutId: NodeJS.Timeout | undefined;

      if (ep) {
        creditsTimeoutId = setTimeout(() => {
          cleanupCredits = attachCreditsButton({
            player,
            video,
            fetchCreditsDuration,
            nome,
            ep,
            creditsButtonRef,
            creditsDurationRef,
            onVideoEnd,
          });
        }, 3000);
      }
      // 5. Orientaçao em moblie
      const cleanupFullscreenOrientation = attachFullscreenOrientation(player);
      return () => {
        if (creditsTimeoutId) clearTimeout(creditsTimeoutId);

        cleanupCredits?.();
        cleanupIntro?.();
        cleanupKeyboard?.();
        cleanupVideoListeners?.();
        cleanupHls?.();
        cleanupFullscreenOrientation?.();
      };
    });
  }, [videoId]);

  return (
    <div key={videoId} style={{ width: "100%", height: "auto" }}>
      <Plyr
        ref={plyrRef}
        source={{
          type: "video",
          sources: [],
          poster: thumbnail,
        }}
        options={plyrOptions}
      />
    </div>
  );
};

export default CardPlayer;
