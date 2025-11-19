import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import { AppProviders } from "./context/AppProviders.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppProviders>
  </StrictMode>
);
