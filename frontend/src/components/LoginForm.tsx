import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-4">Entrar</h2>
      <label className="block mb-2">
        <span className="text-sm">Email</span>
        <input
          type="email"
          className="mt-1 block w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block mb-4">
        <span className="text-sm">Senha</span>
        <input
          type="password"
          className="mt-1 block w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 rounded bg-blue-600 text-white"
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar com Firebase"}
      </button>
    </form>
  );
};
