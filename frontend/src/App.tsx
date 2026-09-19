import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Competitions } from "./pages/Competitions";
import { AthletePage } from "./pages/AthletePage";
import { Trainings } from "./pages/Trainings";
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

  if (!token) return <Login />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/athletes/:id" element={<AthletePage />} />
        <Route path="/trainings" element={<Trainings />} />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
