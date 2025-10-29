import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useSelector((state) => state.user);

  // Nếu đang verify token -> đợi (tránh redirect sai)
  if (loading) 
    return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
    )

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}