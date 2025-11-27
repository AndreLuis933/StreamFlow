export const TYPE_MAP: Record<string, "animes" | "filmes"> = {
  anime: "animes",
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
[
  "tougen-anki",
  "one-piece",
  "spy-x-family-3",
  "boku-no-hero-academia-final",
  "gachiakuta",
  "Ansatsu Kyoushitsu",
  "Rokudenashi Majutsu Koushi to Akashic Records",
  "Tensai Ouji no Akaji Kokka Saisei Jutsu",
  " tsukimichi moonlit fantasy",
];
