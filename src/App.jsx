import { useState, useEffect } from "react";
import { LoginPage } from "./features/LoginPage/LoginPage.jsx";
import { FeedPage } from "./features/FeedPage/FeedPage.jsx";
import { ProfilePage } from "./features/ProfilePage/ProfilePage.jsx";
import { ThreadsLayout } from "./components/ThreadsLayout/ThreadsLayout.jsx";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("feed");
  const [profileUsername, setProfileUsername] = useState(undefined);

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== "profile") {
      setProfileUsername(undefined);
    }
  };

  const handleProfileClick = (username) => {
    setProfileUsername(username);
    setCurrentPage("profile");
  };

  const handleBackToFeed = () => {
    setCurrentPage("feed");
    setProfileUsername(undefined);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ThreadsLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === "feed" && (
        <FeedPage onProfileClick={handleProfileClick} />
      )}
      {currentPage === "search" && (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Search</h2>
          <p className="text-muted-foreground">Search functionality coming soon...</p>
        </div>
      )}
      {currentPage === "activity" && (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Activity</h2>
          <p className="text-muted-foreground">Activity notifications coming soon...</p>
        </div>
      )}
      {currentPage === "profile" && (
        <ProfilePage
          username={profileUsername}
          onBack={handleBackToFeed}
          onProfileClick={handleProfileClick}
        />
      )}
    </ThreadsLayout>
  );
}