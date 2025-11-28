export function attachFullscreenOrientation(player: Plyr) {
  if (typeof window === "undefined") return () => {};

  const handleEnterFullscreen = () => {
    if (
      typeof screen !== "undefined" &&
      screen.orientation &&
      typeof (screen as any).orientation.lock === "function"
    ) {
      (screen as any).orientation.lock("landscape").catch(() => {});
    }
  };

  const handleExitFullscreen = () => {
    if (
      typeof screen !== "undefined" &&
      screen.orientation &&
      typeof (screen as any).orientation.unlock === "function"
    ) {
      screen.orientation.unlock();
    }
  };

  player.on("enterfullscreen", handleEnterFullscreen);
  player.on("exitfullscreen", handleExitFullscreen);

  return () => {
    player.off("enterfullscreen", handleEnterFullscreen);
    player.off("exitfullscreen", handleExitFullscreen);
  };
}
