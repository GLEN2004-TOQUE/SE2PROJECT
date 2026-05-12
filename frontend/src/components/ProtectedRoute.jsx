import { Navigate } from "react-router-dom";
import { logout } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  teacher: "/teacher",
  student: "/student",
  admin:   "/admin",
};

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  // Token expiry check
  if (user.exp && Date.now() / 1000 > user.exp) {
    logout();
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    const home = ROLE_HOME[user.role] || "/";
    return <Navigate to={home} replace />;
  }

  return children;
}

export default ProtectedRoute;