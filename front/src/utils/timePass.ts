const calcularTempoDecorrido = (diferencaMs: number) => {
  const segundos = Math.floor(diferencaMs / 1000);

  const intervalos = [
    { nomeSingular: "ano", nomePlural: "anos", duracao: 60 * 60 * 24 * 365 },
    { nomeSingular: "mês", nomePlural: "meses", duracao: 60 * 60 * 24 * 30 },
    {
      nomeSingular: "semana",
      nomePlural: "semanas",
      duracao: 60 * 60 * 24 * 7,
    },
    { nomeSingular: "dia", nomePlural: "dias", duracao: 60 * 60 * 24 },
    { nomeSingular: "hora", nomePlural: "horas", duracao: 60 * 60 },
    { nomeSingular: "minuto", nomePlural: "minutos", duracao: 60 },
    { nomeSingular: "segundo", nomePlural: "segundos", duracao: 1 },
  ];

  for (const intervalo of intervalos) {
    const valor = Math.floor(segundos / intervalo.duracao);
    if (valor >= 1) {
      return {
        valor,
        unidade: valor === 1 ? intervalo.nomeSingular : intervalo.nomePlural,
      };
    }
  }
  return { valor: 0, unidade: "segundos" };
};
export const formatarTempoDecorrido = (dataInicial: Date, dataFinal = new Date()) => {
  const diffMs = dataFinal.getTime() - dataInicial.getTime();
  const { valor, unidade } = calcularTempoDecorrido(diffMs);
  return `há ${valor} ${unidade}`;
};
