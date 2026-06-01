import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import "./styles/global.css"; // rename index.css → styles/globals.css
import "./styles/auth.css";
import "./styles/home.css";
import "./styles/chat.css";

const qc = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <Protected>
                <HomePage />
              </Protected>
            }
          />
          <Route
            path="/chat/:docId"
            element={
              <Protected>
                <ChatPage />
              </Protected>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
