import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import CalendarPage from "./pages/CalendarPage";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import { LogoMark } from "./components/Logo";

function Splash() {
  return <div className="flex h-screen items-center justify-center"><div className="animate-pulse"><LogoMark size={44} /></div></div>;
}

// Signed-out visitors are sent to /login; signed-in users skip the auth pages.
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? children : <Navigate to="/login" replace />;
}
function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Public><AuthPage mode="login" /></Public>} />
      <Route path="/register" element={<Public><AuthPage mode="register" /></Public>} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="my-day" element={<TaskList view="my-day" />} />
        <Route path="tasks" element={<TaskList view="all" />} />
        <Route path="upcoming" element={<TaskList view="upcoming" />} />
        <Route path="completed" element={<TaskList view="completed" />} />
        <Route path="overdue" element={<TaskList view="overdue" />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
