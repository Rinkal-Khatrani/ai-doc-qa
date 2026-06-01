// ─── Register Page ────────────────────────────────────────────────────────────

import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { AuthShell } from "../components/authShell/AuthShell";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { email, password });
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const { data } = await api.post("/auth/login", form);
      setToken(data.access_token);
      navigate("/");
    } catch {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Start chatting with your documents"
      linkText="Have an account?"
      linkLabel="Sign in"
      linkTo="/login"
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      submitLabel="Create account"
    />
  );
}
