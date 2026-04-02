import { Navigate } from "react-router-dom";
import { getUser } from "../services/api";

const ROLE_HOME = {
  admin:   "/admin",
  teacher: "/teacher",
  student: "/student",
};

function ProtectedRoute({ children, role }) {
  const user = getUser();

  if (!user) return <Navigate to="/" replace />;

  // Token expiry check
  if (user.exp && Date.now() / 1000 > user.exp) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  // Wrong role → redirect to correct dashboard
  if (role && user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
  }

  return children;
}

export default ProtectedRoute;