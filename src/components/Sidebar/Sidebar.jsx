import { Home, Search, Heart, User, Edit, Menu } from "lucide-react";
import { Button } from "../ui/button.js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.js";
import { currentUser } from "../../data/mockData.js";

export function Sidebar({ currentPage, onNavigate }) {
  const menuItems = [
    { id: "feed", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "activity", label: "Activity", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

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
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="w-6 h-6 mr-4" />
                <span className="text-base">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Create Post Button */}
        <Button className="w-full mt-6 h-12" size="lg">
          <Edit className="w-5 h-5 mr-2" />
          New thread
        </Button>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={() => onNavigate("profile")}
        >
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
            <AvatarFallback>{currentUser.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <div className="font-medium">{currentUser.displayName}</div>
            <div className="text-sm text-muted-foreground">@{currentUser.username}</div>
          </div>
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}