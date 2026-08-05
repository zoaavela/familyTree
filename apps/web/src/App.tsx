import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { MyTrees } from './pages/MyTrees';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { TreeGraph } from './pages/TreeGraph';
import { VerifyEmail } from './pages/VerifyEmail';
import { VerifyPending } from './pages/VerifyPending';
import { FamousTrees } from './pages/FamousTrees';
import { AppShell } from './components/AppShell';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-ink-muted)]">
        Chargement…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* TEMPORAIREMENT DÉSACTIVÉ POUR POUVOIR VOIR L'INTERFACE
  // Si l'utilisateur n'est pas vérifié et n'est pas déjà sur la page d'attente ou la page de vérification
  if (user.emailVerified === false && location.pathname !== '/verify-pending' && location.pathname !== '/verify') {
    return <Navigate to="/verify-pending" replace />;
  }
  
  // Si l'utilisateur est vérifié et tente d'aller sur la page d'attente
  if (user.emailVerified === true && location.pathname === '/verify-pending') {
    return <Navigate to="/app" replace />;
  }
  */

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route
        path="/verify-pending"
        element={
          <PrivateRoute>
            <VerifyPending />
          </PrivateRoute>
        }
      />

      <Route
        path="/app"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="arbres" element={<MyTrees />} />
        <Route path="profil" element={<Profile />} />
        <Route path="profil/:userId" element={<Profile />} />
        <Route path="parametres" element={<Settings />} />
      </Route>

      <Route
        path="/app/inspiration"
        element={
          <PrivateRoute>
            <FamousTrees />
          </PrivateRoute>
        }
      />

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