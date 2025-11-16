// hooks/listeners/skipSegmentButtonListener.ts
import type { CleanupFn } from "./videoListeners";

type FetchSegmentDuration = (
  nome: string,
  ep: string
) => Promise<{ start_sec: number; end_sec: number } | null>;

export function attachSkipSegmentButton({
  player,
  video,
  fetchSegmentDuration,
  nome,
  ep,
  buttonRef,
  segmentDurationRef,
  label,
}: {
  player: any; // Plyr instance
  video: HTMLVideoElement;
  fetchSegmentDuration: FetchSegmentDuration;
  nome: string;
  ep: string;
  buttonRef: React.MutableRefObject<HTMLButtonElement | null>;
  segmentDurationRef: React.MutableRefObject<{
    start_sec: number;
    end_sec: number;
  } | null>;
  label: string;
}): CleanupFn {
  async function initializeCustomButton() {
    const duracao = await fetchSegmentDuration(nome, ep);
    if (!duracao) return;
    segmentDurationRef.current = duracao;

    const container = player.elements.container;
    if (!container) return;

    if (!buttonRef.current) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "custom-center-button";
      btn.setAttribute("aria-label", label);
      btn.textContent = label;
      btn.style.display = "none";

      btn.addEventListener("click", () => {
        if (segmentDurationRef.current) {
          player.currentTime = segmentDurationRef.current.end_sec;
        }
      });

      container.appendChild(btn);
      buttonRef.current = btn;
    }
  }

  const handleTimeUpdate = () => {
    const currentTime = video.currentTime;
    const duracao = segmentDurationRef.current;
    const btn = buttonRef.current;

    if (duracao && btn) {
      if (currentTime >= duracao.start_sec && currentTime <= duracao.end_sec) {
        btn.style.display = "block";
      } else {
        btn.style.display = "none";
      }
    }
  };

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
