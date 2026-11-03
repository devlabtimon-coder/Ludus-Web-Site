import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./app/App.tsx";
import { GOOGLE_CLIENT_ID, GOOGLE_LOGIN_ENABLED } from "./config/google";
import "./styles/index.css";

// Sem client ID o provedor do Google quebra a página inteira; nesse caso o painel sobe só com e-mail e senha.
createRoot(document.getElementById("root")!).render(
  GOOGLE_LOGIN_ENABLED ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  ) : (
    <App />
  )
);
