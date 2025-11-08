import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { ModalProvider } from "./Modal";
import { darkTheme } from "@/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // opcional, para debug
import { useState } from "react";

type Props = {
  children: ReactNode;
};

export const AppProviders = ({ children }: Props) => {
  // Criamos apenas UMA instância do QueryClient
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // dados "frescos" por 5 minutos
            refetchOnWindowFocus: false, // opcional: evita refetch ao focar janela
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <ModalProvider>{children}</ModalProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
