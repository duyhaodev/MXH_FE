import { Home, Search, Heart, User, Edit, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button.js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.js";
import { useSelector, useDispatch } from "react-redux";
import { openComposer, closeComposer, selectComposerOpen, selectComposerPrefill } from "../../store/composerSlice";
import { createPortal } from "react-dom";
import { CreatePost } from "../CreatePost/CreatePost.jsx";
import { Skeleton } from "../ui/skeleton.js";

export function Sidebar({ currentPage }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile, loading } = useSelector((state) => state.user);
  const open = useSelector(selectComposerOpen);       
  const prefill = useSelector(selectComposerPrefill); 
  console.log(profile);

  const currentUser = {
    displayName: profile.fullName,
    username: profile.userName,
    avatar: profile.avatarUrl || null
  }



  const menuItems = [
    { id: "feed", label: "Home", icon: Home, path: "/feed" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "activity", label: "Activity", icon: Heart, path: "/activity" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  const renderProfileSection = () => {
    if (loading || !profile) {
      return (
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      );
    }
    
    const currentUser = {
      displayName: profile.fullName,
      username: profile.userName,
      avatar: profile.avatar || null
    }

    return (
      <Button
        variant="ghost"
        className="w-full justify-start h-auto p-0" // p-0 to let inner content define padding
        onClick={() => navigate("/profile")}
      >
        <div className="flex items-center w-full p-3">
            <Avatar className="w-10 h-10 mr-3">
              {currentUser.avatar ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
              ) : (
                <AvatarFallback>
                  {currentUser.username && currentUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 text-left">
              <div className="font-medium">{currentUser.displayName}</div>
              <div className="text-sm text-muted-foreground">@{currentUser.username}</div>
            </div>
            <Menu className="w-5 h-5" />
        </div>
      </Button>
    );
  }

  return (
    <div className="w-64 h-screen border-r border-border bg-background flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">Threads</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start h-12 px-4"
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-6 h-6 mr-4" />
                <span className="text-base">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Create Post Button */}
        <Button
          className="w-full mt-6 h-12"
          size="lg"
          onClick={() => dispatch(openComposer({ text: "", files: [] }))} 
        >
          <Edit className="w-5 h-5 mr-2" />
          New thread
        </Button>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={() => navigate("/profile")}
        >
          <Avatar className="w-10 h-10 mr-3">
            {currentUser.avatar ? (
              <AvatarImage 
                src={currentUser.avatar || "/default-avatar.png"}
                alt={currentUser.displayName}
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }} 
              />
            ) : (
              <AvatarFallback>
                {(currentUser.username && currentUser.username.charAt(0)) || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 text-left">
            <div className="font-medium">{currentUser.displayName}</div>
            <div className="text-sm text-muted-foreground">@{currentUser.username}</div>
          </div>
          <Menu className="w-5 h-5" />
        </Button>
        {renderProfileSection()}
      </div>

      {createPortal(
        <CreatePost
          open={open}
          onOpenChange={(v) => v ? dispatch(openComposer(prefill)) : dispatch(closeComposer())}
          onCreatePost={() => { }}
        />,
        document.body
      )}
    </div>
  );
}