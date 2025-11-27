import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";
import { MessagePopup } from "../MessagePopup/MessagePopup";

export function ThreadsLayout() {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1] || 'feed';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage={currentPage} />
      <main className="flex-1 border-r border-border overflow-y-auto">
        <Outlet />
      </main>
      <div className="w-80 p-6 hidden lg:block">
        {/* Right sidebar for suggested users, trending, etc. */}
        <div className="space-y-6">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-3">Suggested for you</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">John Doe</p>
                    <p className="text-xs text-muted-foreground">@johndoe</p>
                  </div>
                </div>
                <button className="text-sm text-blue-500 hover:underline">Follow</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Jane Smith</p>
                    <p className="text-xs text-muted-foreground">@janesmith</p>
                  </div>
                </div>
                <button className="text-sm text-blue-500 hover:underline">Follow</button>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-3">What's happening</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Trending in Technology</p>
                <p className="font-medium">#ReactJS</p>
                <p className="text-xs text-muted-foreground">45.2K threads</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trending</p>
                <p className="font-medium">#WebDevelopment</p>
                <p className="text-xs text-muted-foreground">28.1K threads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
              {/* Message Popup */}
            <MessagePopup />
    </div>
  );
}