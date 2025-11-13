// hooks/useVideoEventListeners.ts
import { useEffect, useRef } from "react";
import { fetchIntroDuration } from "@/services/anime";
import { attachVideoListeners } from "./listeners/videoListeners";
import { attachKeyboardListeners } from "./listeners/keyboardListeners";
import { attachIntroButton } from "./listeners/introButtonListeners";

interface UseVideoEventListenersProps {
  plyrRef: React.MutableRefObject<any>;
  videoId: string;
  onVideoEnd: () => void;
  saveProgress: (currentTime: number) => void;
  clearProgress: () => void;
  restoreProgress: (video: HTMLVideoElement) => void;
  nome: string;
  ep: string;
}

export const useVideoEventListeners = ({
  plyrRef,
  videoId,
  onVideoEnd,
  saveProgress,
  clearProgress, // mantido para compatibilidade, mesmo que não use aqui
  restoreProgress,
  nome,
  ep,
}: UseVideoEventListenersProps) => {
  const customButtonRef = useRef<HTMLButtonElement | null>(null);
  const introDurationRef = useRef<{
    start_sec: number;
    end_sec: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 50;

    // Vamos armazenar os cleanups de cada utilitário
    let videoCleanup: (() => void) | null = null;
    let keyboardCleanup: (() => void) | null = null;
    let buttonCleanup: (() => void) | null = null;

    const setupListeners = () => {
      const player = plyrRef.current?.plyr;
      const video: HTMLVideoElement | undefined = player?.media;

      if (video && player && isMounted) {
        // 1) Vídeo (progresso/restauração)
        videoCleanup = attachVideoListeners({
          video,
          saveProgress,
          restoreProgress,
        });

        // 2) Teclado
        keyboardCleanup = attachKeyboardListeners({
          onVideoEnd,
        });

        // 3) Botão "Pular Abertura"
        buttonCleanup = attachIntroButton({
          player,
          video,
          fetchIntroDuration,
          nome,
          ep,
          customButtonRef,
          introDurationRef,
        });

        // Cleanup específico desse setup
        return () => {
          if (buttonCleanup) {
            buttonCleanup();
            buttonCleanup = null;
          }
          if (keyboardCleanup) {
            keyboardCleanup();
            keyboardCleanup = null;
          }
          if (videoCleanup) {
            videoCleanup();
            videoCleanup = null;
          }
        };
      } else if (attempts < maxAttempts && isMounted) {
        attempts++;
        setTimeout(setupListeners, 100);
      }
    };

    const cleanup = setupListeners();

    // Cleanup do efeito (fallback/garantia)
    return () => {
      isMounted = false;
      if (typeof cleanup === "function") cleanup();
      if (buttonCleanup) buttonCleanup();
      if (keyboardCleanup) keyboardCleanup();
      if (videoCleanup) videoCleanup();
    };
  }, [
    onVideoEnd,
    videoId,
    plyrRef,
    saveProgress,
    clearProgress,
    restoreProgress,
    nome,
    ep,
  ]);
};
