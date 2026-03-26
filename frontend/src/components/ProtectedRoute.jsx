import { Navigate } from "react-router-dom";
import { getUser } from "../services/api";

function ProtectedRoute({ children, role }) {
  const user = getUser();

  if (!user) return <Navigate to="/" replace />;

  // Token expiry check
  if (user.exp && Date.now() / 1000 > user.exp) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to the correct dashboard instead of login
    return <Navigate to={user.role === "teacher" ? "/teacher" : "/student"} replace />;
  }

  return children;
}

export default ProtectedRoute;