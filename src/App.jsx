import { Activity, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./features/LoginPage/LoginPage.jsx";
import { FeedPage } from "./features/FeedPage/FeedPage.jsx";
import { ProfilePage } from "./features/ProfilePage/ProfilePage.jsx";
import { ThreadsLayout } from "./components/ThreadsLayout/ThreadsLayout.jsx";
import { RegisterPage } from "./features/RegisterPage/RegisterPage.jsx";
import SearchPage from "./features/SearchPage/SearchPage.jsx";
import ActivityPage from "./features/ActivityPage/ActivityPage.jsx";

export default function App() {
  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<ThreadsLayout />}>
          <Route index element={<Navigate to="/feed" replace />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="search" element={ <SearchPage />} />
          <Route path="activity" element={ <ActivityPage /> } />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch all - redirect to feed */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </BrowserRouter>
  );
}