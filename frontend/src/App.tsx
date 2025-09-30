import React from 'react';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';


const AppInner: React.FC = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
