import React from "react";
import { Dashboard } from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./pages/Login";

const AppInner: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    );
  }

  // Só monta o Dashboard depois que o token está pronto no Apollo
  return token ? <Dashboard /> : <Login />;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
