// hooks/listeners/creditsButtonListeners.ts
import type { CleanupFn } from "./videoListeners";
import { attachSkipSegmentButton } from "./skipSegmentButtonListener";

export function attachCreditsButton(params: {
  player: any;
  video: HTMLVideoElement;
  fetchCreditsDuration: (
    nome: string,
    ep: string
  ) => Promise<{ start_sec: number; end_sec: number }|null>;
  nome: string;
  ep: string;
  creditsButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  creditsDurationRef: React.MutableRefObject<{
    start_sec: number;
    end_sec: number;
  } | null>;
}): CleanupFn {
  const {
    player,
    video,
    fetchCreditsDuration,
    nome,
    ep,
    creditsButtonRef,
    creditsDurationRef,
  } = params;

  return attachSkipSegmentButton({
    player,
    video,
    fetchSegmentDuration: fetchCreditsDuration,
    nome,
    ep,
    buttonRef: creditsButtonRef,
    segmentDurationRef: creditsDurationRef,
    label: "Pular Créditos",
  });
}
