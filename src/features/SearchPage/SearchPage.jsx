import { useState, useEffect } from "react";
import { Search, Verified } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { PostCard } from "../../components/PostCard/PostCard.jsx";
import { searchApi } from "../../api/searchApi";

export function SearchPage({ onProfileClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        setPosts([]);
        return;
      }

      setLoading(true);
      try {
        const res = await searchApi.search(searchQuery);
        console.log("🔍 Response from backend:", res);

        const data = res.data || res; // axiosClient có thể trả .data hoặc cả response
        if (data.code === 200 && data.result) {
          setUsers(data.result.users || []);
          setPosts(data.result.posts || []);
        } else {
          setUsers([]);
          setPosts([]);
        }
      } catch (err) {
        console.error("❌ Search error:", err);
        setUsers([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchData, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

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
                    <UserCard key={user.id} user={user} onProfileClick={onProfileClick} />
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
                    <PostCard key={post.id} post={post} onProfileClick={onProfileClick} />
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
                  <UserCard key={user.id} user={user} onProfileClick={onProfileClick} />
                ))
              ) : (
                <NoData text="No users found" />
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-0">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} onProfileClick={onProfileClick} />
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

function UserCard({ user, onProfileClick }) {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  return (
    <div className="border-b border-border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto rounded-full"
          onClick={() => onProfileClick?.(user.userName)}
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            <AvatarFallback>{(user.fullName || "?").charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>

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

        <Button variant="outline" size="sm">
          Follow
        </Button>
      </div>
    </div>
  );
}

export default SearchPage;