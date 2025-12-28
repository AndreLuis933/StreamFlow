export const TYPE_MAP: Record<string, "series" | "filmes"> = {
  serie: "series",
  movie: "filmes",
};
export const plyrOptions = {
  keyboard: { focused: true, global: true },
  seekTime: 10,
  tooltips: { controls: true, seek: true },
  ratio: "16:9",
  controls: [
    "play",
    "progress",
    "current-time",
    "mute",
    "volume",
    "settings",
    "fullscreen",
  ],
  settings: ["speed"],
  speed: {
    selected: 1,
    options: [0.5, 0.75, 1, 1.25, 1.5, 2],
  },
};
