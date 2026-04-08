import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../ui/components/Card";
import { Input } from "../ui/components/Input";
import { Button } from "../ui/components/Button";

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
    <Card className="max-w-sm">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-4">Entrar</h2>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="mt-4">
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 mb-2 mt-2">{error}</div>}
        <div className="mt-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
