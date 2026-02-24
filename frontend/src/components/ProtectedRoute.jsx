import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  const payload = JSON.parse(atob(token.split(".")[1]));

  if (payload.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;