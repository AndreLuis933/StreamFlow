// hooks/listeners/introButtonListeners.ts
import type { CleanupFn } from "./videoListeners";
import { attachSkipSegmentButton } from "./skipSegmentButtonListener";

export function attachIntroButton(params: {
  player: any;
  video: HTMLVideoElement;
  fetchIntroDuration: (
    nome: string,
    ep: string
  ) => Promise<{ start_sec: number; end_sec: number } | null>;
  nome: string;
  ep: string;
  introButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  introDurationRef: React.MutableRefObject<{
    start_sec: number;
    end_sec: number;
  } | null>;
}): CleanupFn {
  const {
    player,
    video,
    fetchIntroDuration,
    nome,
    ep,
    introButtonRef,
    introDurationRef,
  } = params;
  
  function onClick() {
    if (introDurationRef.current) {
      player.currentTime = introDurationRef.current.end_sec;
    }
  }
  return attachSkipSegmentButton({
    player,
    video,
    fetchSegmentDuration: fetchIntroDuration,
    nome,
    ep,
    buttonRef: introButtonRef,
    segmentDurationRef: introDurationRef,
    label: "Pular Abertura",
    onClick,
  });
}
