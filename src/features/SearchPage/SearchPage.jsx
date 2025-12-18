import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Verified, Check } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { PostCard } from "../../components/PostCard/PostCard.jsx";
import { searchApi } from "../../api/searchApi";
import followApi from "../../api/followApi";
import userApi from "../../api/userApi";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setSearchPosts, selectSearchPosts } from "../../store/postsSlice";

export function SearchPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const posts = useSelector(selectSearchPosts);
  // States cho current user
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fetch current user khi mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setAuthLoading(true);
        setAuthError(null);
        
        const response = await userApi.getMyInfo();
        
        // Adjust theo backend response thực tế (có thể là response.data hoặc response trực tiếp)
        const userData = response.data || response;
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setAuthError(err.response?.data?.message || 'Failed to load user');
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const onProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        dispatch(setSearchPosts([]));
        return;
      }

      setLoading(true);
      try {
        const res = await searchApi.search(searchQuery);
        console.log("🔍 Response from backend:", res);

        const data = res.data || res; // axiosClient có thể trả .data hoặc cả response
        if (data.code === 200 && data.result) {
          const rawPosts = data.result.posts || [];
          const normalizedPosts = rawPosts.map(p => ({
            ...p,
            mediaList: typeof p.mediaList === "string" 
              ? JSON.parse(p.mediaList)
              : (p.mediaList || [])
          }));
          dispatch(setSearchPosts(normalizedPosts));
          setUsers(data.result.users || []);
        } else {
          setUsers([]);
          dispatch(setSearchPosts([]));
        }
      } catch (err) {
        console.error("❌ Search error:", err);
        setUsers([]);
        dispatch(setSearchPosts([]));
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [searchQuery, dispatch]);

  const totalResults = users.length + posts.length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b border-border p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl font-semibold">Search</h2>
      </div>

      <div>
        <div className="pt-5"></div>
        <div className="flex items-center gap-2 bg-muted p-2 rounded">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for users or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent"
          />
        </div>
        {!searchQuery.trim() ? (
          <EmptyState
            icon={Search}
            title="Search Threads"
            subtitle="Find users and posts on Threads"
          />
        ) : loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : totalResults === 0 ? (
          <EmptyState
            icon={Search}
            title="No results found"
            subtitle="Try searching for something else"
          />
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger value="all" className="tab-btn">
                All ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="users" className="tab-btn">
                Users ({users.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="tab-btn">
                Posts ({posts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {users.length > 0 && (
                <Section
                  title="Users"
                  items={users}
                  renderItem={(user) => (
                    <UserCard 
                      key={user.id} 
                      user={user} 
                      onProfileClick={onProfileClick}
                      currentUserId={currentUser?.result.id}
                      authLoading={authLoading}
                    />
                  )}
                  total={users.length}
                  switchTab="users"
                  onViewAll={() => setCurrentTab("users")}
                />
              )}
              {posts.length > 0 && (
                <Section
                  title="Posts"
                  items={posts}
                  renderItem={(post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onProfileClick={onProfileClick}
                      onPostClick={(id) => navigate(`/post/${id}`)}
                    />
                  )}
                  total={posts.length}
                  switchTab="posts"
                  onViewAll={() => setCurrentTab("posts")}
                />
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              {users.length > 0 ? (
                users.map((user) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onProfileClick={onProfileClick}
                    currentUserId={currentUser?.id}
                    authLoading={authLoading}
                  />
                ))
              ) : (
                <NoData text="No users found" />
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-0">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onProfileClick={onProfileClick}
                    onPostClick={(id) => navigate(`/post/${id}`)}
                  />
                ))
              ) : (
                <NoData text="No posts found" />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="p-8 text-center">
      <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function NoData({ text }) {
  return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

function Section({ title, items, renderItem, total, onViewAll }) {
  return (
    <div>
      <div className="p-4 border-b border-border">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
      </div>
      {items.slice(0, 3).map(renderItem)}
      {items.length > 3 && (
        <div className="p-4 border-b border-border text-center">
          <Button
            variant="link"
            className="text-muted-foreground"
            onClick={onViewAll}
          >
            View all {total} {title.toLowerCase()}
          </Button>
        </div>
      )}
    </div>
  );
}

function UserCard({ user, onProfileClick, currentUserId, authLoading }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Nếu là chính user hiện tại, không fetch status và không show button
  const isCurrentUser = user.id === currentUserId;
  console.log("current:", currentUserId);
  // Fetch initial following status (chỉ nếu không phải current user và không đang loading auth)
  useEffect(() => {
    if (isCurrentUser || authLoading || !user.id) return;

    const checkStatus = async () => {
      try {
        const res = await followApi.checkFollowing(user.id);
        console.log("API res for checkFollowing:", res);
        const followingStatus = res?.data?.isFollowingValue ?? res?.isFollowingValue ?? false;
        setIsFollowing(!!followingStatus);  // Convert to boolean
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };

    checkStatus();
  }, [user.id, isCurrentUser, authLoading]);

  const handleToggleFollow = async () => {
    if (buttonLoading || isCurrentUser) return;
    setButtonLoading(true);

    try {
      const res = await followApi.toggleFollow(user.id);
      console.log("API res for toggleFollow:", res);  // Debug
      const newStatus = res?.data?.isFollowing ?? res?.isFollowing ?? !isFollowing;
      setIsFollowing(!!newStatus);
      toast.success(res?.data?.message ?? res?.message ?? (newStatus ? "Đã follow!" : "Đã unfollow!"));
    } catch (err) {
      console.error("Toggle follow error:", err);
      toast.error(err.response?.data?.message || "Toggle follow failed!");
      // Revert on error if needed, but skip for simplicity
    } finally {
      setButtonLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  return (
    <div className="border-b border-border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar + click vào profile */}
        <button
          className="p-0 h-auto rounded-full"
          onClick={() => onProfileClick?.(user.userName)}
          title={user.fullName}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            <AvatarFallback>{user.fullName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:underline"
              onClick={() => onProfileClick?.(user.userName)}
            >
              <span className="font-medium">{user.fullName}</span>
            </Button>
            {user.verified && (
              <Verified className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            @{user.userName}
          </p>
          {user.bio && <p className="text-sm mb-2 line-clamp-2">{user.bio}</p>}
          {user.followers !== undefined && (
            <p className="text-sm text-muted-foreground">
              {formatNumber(user.followers)} followers
            </p>
          )}
        </div>

        {/* Chỉ show button nếu không phải current user và auth đã load xong */}
        {!isCurrentUser && !authLoading && (
          <Button 
            variant={isFollowing ? "secondary" : "outline"} 
            size="sm" 
            onClick={handleToggleFollow}
            disabled={buttonLoading}
            className={isFollowing ? "text-green-600 border-green-600 hover:bg-green-50" : ""}
          >
            {buttonLoading ? "..." : isFollowing ? (
              <>
                <Check className="w-4 h-4 mr-1" /> Following
              </>
            ) : "Follow"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default SearchPage;