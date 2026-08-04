import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { MyTrees } from './pages/MyTrees';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { TreeGraph } from './pages/TreeGraph';
import { AppShell } from './components/AppShell';

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
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/app"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<MyTrees />} />
        <Route path="profil" element={<Profile />} />
        <Route path="parametres" element={<Settings />} />
      </Route>

      <Route
        path="/app/trees/:treeId/graph"
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