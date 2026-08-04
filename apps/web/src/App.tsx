import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { TreesList } from './pages/TreesList';
import { TreeDetail } from './pages/TreeDetail';
import { TreeGraph } from './pages/TreeGraph';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, booting } = useAuth();
  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-ink-muted)]">
        Chargement…
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/trees"
        element={
          <PrivateRoute>
            <TreesList />
          </PrivateRoute>
        }
      />
      <Route
        path="/trees/:treeId"
        element={
          <PrivateRoute>
            <TreeDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/trees/:treeId/graph"
        element={
          <PrivateRoute>
            <TreeGraph />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;