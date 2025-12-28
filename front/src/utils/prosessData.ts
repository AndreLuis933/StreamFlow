import type { DetalhesSerieResponse } from "@/types/api";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function parseSerieResponse(raw: any): DetalhesSerieResponse {
  return {
    ...raw,
    pageProps: {
      ...raw.pageProps,
      data: {
        ...raw.pageProps.data,
        generos: raw.pageProps.data.generos
          .split(",")
          .map((genero: string) => capitalize(genero.trim())),
      },
    },
  };
}
