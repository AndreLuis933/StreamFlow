// hooks/listeners/creditsButtonListeners.ts
import type { CleanupFn } from "./videoListeners";
import { attachSkipSegmentButton } from "./skipSegmentButtonListener";

export function attachCreditsButton(params: {
  player: any;
  video: HTMLVideoElement;
  fetchCreditsDuration: (
    nome: string,
    ep: string
  ) => Promise<{ start_sec: number; end_sec: number } | null>;
  nome: string;
  ep: string;
  creditsButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  creditsDurationRef: React.MutableRefObject<{
    start_sec: number;
    end_sec: number;
  } | null>;
  onVideoEnd: () => void;
}): CleanupFn {
  const {
    player,
    video,
    fetchCreditsDuration,
    nome,
    ep,
    creditsButtonRef,
    creditsDurationRef,
    onVideoEnd,
  } = params;
  function onClick() {
    if (
      creditsDurationRef.current
    ) {
      if (player.duration - creditsDurationRef.current.end_sec <= 30) {
        player.currentTime = creditsDurationRef.current.end_sec;
        onVideoEnd();
      } else {
        player.currentTime = creditsDurationRef.current.end_sec;
      }
    }
  }

  return attachSkipSegmentButton({
    player,
    video,
    fetchSegmentDuration: fetchCreditsDuration,
    nome,
    ep,
    buttonRef: creditsButtonRef,
    segmentDurationRef: creditsDurationRef,
    label: "Pular Créditos",
    onClick,
  });
}
