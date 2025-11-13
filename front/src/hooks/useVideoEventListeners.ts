// hooks/useVideoEventListeners.ts
import { fetchIntroDuration } from "@/services/anime";
import { useEffect, useRef } from "react"; // Importe useRef

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
  clearProgress,
  restoreProgress,
  nome,
  ep,
}: UseVideoEventListenersProps) => {
  // Usar um ref para o botão para que possamos acessá-lo no timeupdate
  const customButtonRef = useRef<HTMLButtonElement | null>(null);
  // Usar um ref para a duração da intro para que ela persista entre re-renders
  const introDurationRef = useRef<{
    start_sec: number;
    end_sec: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 50;
    let saveInterval: NodeJS.Timeout;

    const setupListeners = () => {
      const video = plyrRef.current?.plyr?.media;
      const player = plyrRef.current?.plyr;

      if (video && player && isMounted) {
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

        // --- Nova abordagem para o botão ---
        async function initializeCustomButton() {
          const duracao = await fetchIntroDuration(nome, ep);
          introDurationRef.current = duracao; // Armazena a duração no ref

          const container = player.elements.container;
          if (!container) return;

          // Cria o botão apenas se ele ainda não existir
          if (!customButtonRef.current) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "custom-center-button";
            btn.setAttribute("aria-label", "Custom Center Button");
            btn.textContent = "Pular Abertura";
            btn.style.display = "none"; // Começa oculto

            btn.addEventListener("click", () => {
              if (introDurationRef.current) {
                player.currentTime = introDurationRef.current.end_sec;
              }
            });
            container.appendChild(btn);
            customButtonRef.current = btn; // Armazena a referência do botão
          }
        }

        // Handler do timeupdate que usa os refs
        const handleTimeUpdate = () => {
          const currentTime = video.currentTime;
          const duracao = introDurationRef.current;
          const btn = customButtonRef.current;

          if (duracao && btn) {
            if (
              currentTime >= duracao.start_sec &&
              currentTime <= duracao.end_sec
            ) {
              btn.style.display = "block";
            } else {
              btn.style.display = "none";
            }
          }
        };
        // --- Fim da nova abordagem ---

        // Inicializa o botão e busca a duração
        if (player.ready) {
          initializeCustomButton();
        } else {
          player.on("ready", initializeCustomButton);
        }

        window.addEventListener("keydown", handleKeyDown);

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("play", startSaving);
        video.addEventListener("pause", handlePause);
        video.addEventListener("timeupdate", handleTimeUpdate); // Adiciona o listener aqui

        return () => {
          // Cleanup para todos os listeners
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("pause", handlePause);
          video.removeEventListener("play", startSaving);
          video.removeEventListener("timeupdate", handleTimeUpdate); // Remove o listener aqui

          window.removeEventListener("keydown", handleKeyDown);
          if (saveInterval) clearInterval(saveInterval);

          // Opcional: remover o botão do DOM quando o componente desmontar
          if (customButtonRef.current && customButtonRef.current.parentNode) {
            customButtonRef.current.parentNode.removeChild(
              customButtonRef.current
            );
            customButtonRef.current = null;
          }
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
