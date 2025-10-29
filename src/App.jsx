import { Activity, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./features/LoginPage/LoginPage.jsx";
import { FeedPage } from "./features/FeedPage/FeedPage.jsx";
import { ProfilePage } from "./features/ProfilePage/ProfilePage.jsx";
import { ThreadsLayout } from "./components/ThreadsLayout/ThreadsLayout.jsx";
import { RegisterPage } from "./features/RegisterPage/RegisterPage.jsx";
import SearchPage from "./features/SearchPage/SearchPage.jsx";
import ActivityPage from "./features/ActivityPage/ActivityPage.jsx";
import { Toaster } from "sonner";
import { verifyToken } from "./store/userSlice.js";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx"
import { Spinner } from "@/components/ui/spinner"

export default function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
    dispatch(verifyToken());
  }, [dispatch]);

  // Khi đang verify token, chặn render router để tránh flash / redirect sai
  if (loading) 
    return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  )

  return (
    <>
    <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes with Layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ThreadsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FeedPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="search" element={ <SearchPage />} />
            <Route path="activity" element={ <ActivityPage /> } />
            <Route path="profile/:username" element={<ProfilePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch all - redirect to feed */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter> 
    </>
  );
}