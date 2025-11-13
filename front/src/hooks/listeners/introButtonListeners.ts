// hooks/listeners/introButtonListeners.ts
import type { CleanupFn } from "./videoListeners";

export function attachIntroButton({
  player,
  video,
  fetchIntroDuration,
  nome,
  ep,
  customButtonRef,
  introDurationRef,
}: {
  player: any; // Plyr instance
  video: HTMLVideoElement;
  fetchIntroDuration: (
    nome: string,
    ep: string
  ) => Promise<{ start_sec: number; end_sec: number }>;
  nome: string;
  ep: string;
  customButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  introDurationRef: React.MutableRefObject<{
    start_sec: number;
    end_sec: number;
  } | null>;
}): CleanupFn {
  let cancelled = false;

  async function setup() {
    const duracao = await fetchIntroDuration(nome, ep);
    if (cancelled) return;
    introDurationRef.current = duracao;

    const container = player.elements?.container;
    if (!container) return;

    if (!customButtonRef.current) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "custom-center-button";
      btn.setAttribute("aria-label", "Pular Abertura");
      btn.textContent = "Pular Abertura";
      btn.style.display = "none";

      btn.addEventListener("click", () => {
        if (introDurationRef.current) {
          player.currentTime = introDurationRef.current.end_sec;
        }
      });

      container.appendChild(btn);
      customButtonRef.current = btn;
    }
  }

  const handleTimeUpdate = () => {
    const currentTime = video.currentTime;
    const duracao = introDurationRef.current;
    const btn = customButtonRef.current;

    if (duracao && btn) {
      if (currentTime >= duracao.start_sec && currentTime <= duracao.end_sec) {
        btn.style.display = "block";
      } else {
        btn.style.display = "none";
      }
    }
  };

  // Se o player já estiver pronto, configura imediatamente; senão, espera o "ready"
  let removePlyrReady: (() => void) | null = null;
  if (player?.ready) {
    setup();
  } else if (player?.on) {
    const onReady = () => setup();
    player.on("ready", onReady);
    removePlyrReady = () => {
      // plyr tem .off na maioria das versões
      if (player.off) player.off("ready", onReady);
    };
  }

  video.addEventListener("timeupdate", handleTimeUpdate);

  return () => {
    cancelled = true;
    if (removePlyrReady) removePlyrReady();

    video.removeEventListener("timeupdate", handleTimeUpdate);

    if (customButtonRef.current?.parentNode) {
      customButtonRef.current.parentNode.removeChild(customButtonRef.current);
      customButtonRef.current = null;
    }
  };
}
