import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { ModalProvider } from "./Modal";
import { darkTheme } from "../theme";

type Props = {
  children: ReactNode;
};

export const AppProviders = ({ children }: Props) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <ModalProvider>{children}</ModalProvider>
    </ThemeProvider>
  );
};
