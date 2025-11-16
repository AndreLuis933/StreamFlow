// utils/waitForPlayer.ts
export const waitForPlayer = (
  plyrRef: React.MutableRefObject<any>,
  callback: (player: any, video: HTMLVideoElement) => (() => void) | void,
  maxAttempts = 50,
  interval = 100
): (() => void) => {
  let isMounted = true;
  let attempts = 0;
  let cleanup: (() => void) | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const check = () => {
    if (!isMounted) return;

    const player = plyrRef.current?.plyr;
    const video = player?.media as HTMLVideoElement | undefined;

    if (video && player) {
      // ✅ Player está pronto!
      const result = callback(player, video);
      cleanup = typeof result === "function" ? result : null;
    } else if (attempts < maxAttempts) {
      // ⏳ Ainda não está pronto, tenta novamente
      attempts++;
      timeoutId = setTimeout(check, interval);
    } else {
      // ❌ Timeout - player não carregou
      console.warn(
        "waitForPlayer: Player não carregou após",
        maxAttempts,
        "tentativas"
      );
    }
  };

  check();

  // Cleanup function
  return () => {
    isMounted = false;
    if (timeoutId) clearTimeout(timeoutId);
    if (cleanup) cleanup();
  };
};
