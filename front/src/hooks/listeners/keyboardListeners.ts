// hooks/listeners/keyboardListeners.ts
import type { CleanupFn } from "./videoListeners";

export function attachKeyboardListeners({
  onVideoEnd,
}: {
  onVideoEnd: () => void;
}): CleanupFn {
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

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}
