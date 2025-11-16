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


  video.addEventListener("timeupdate", handleTimeUpdate);

  return () => {
    video.removeEventListener("timeupdate", handleTimeUpdate);
  };
}
