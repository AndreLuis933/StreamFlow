// hooks/listeners/introButtonListeners.ts
import type { CleanupFn } from "./videoListeners";
import { attachSkipSegmentButton } from "./skipSegmentButtonListener";
import { fetchSegmentDurationFirebase } from "@/services/firebase";

export function attachIntroButton(params: {
  player: any;
  video: HTMLVideoElement;
  fetchIntroDuration: (nome: string, ep: string) => Promise<void>;
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

  const fetchSegmentDuration = () =>
    fetchSegmentDurationFirebase(nome, ep, "intro", fetchIntroDuration);
  return attachSkipSegmentButton({
    player,
    video,
    fetchSegmentDuration,
    buttonRef: introButtonRef,
    segmentDurationRef: introDurationRef,
    label: "Pular Abertura",
    onClick,
  });
}
