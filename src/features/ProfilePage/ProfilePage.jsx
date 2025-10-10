import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import { MoreHorizontal, Share, Verified, ArrowLeft } from "lucide-react";
import { PostCard } from "../../components/PostCard/PostCard.jsx";
import { mockUsers, mockPosts, currentUser } from "../../data/mockData.js";

export function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Find user by username or default to current user
  const user = username 
    ? mockUsers.find(u => u.username === username) || currentUser
    : currentUser;
  
  const isOwnProfile = user.id === currentUser.id;
  
  // Filter posts by this user
  const userPosts = mockPosts.filter(post => post.author.id === user.id);

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleBack = () => {
    navigate("/feed");
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-border p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <p className="text-sm text-muted-foreground">{userPosts.length} threads</p>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              {user.verified && (
                <Verified className="w-6 h-6 text-blue-500 fill-blue-500" />
              )}
            </div>
            <p className="text-muted-foreground mb-1">@{user.username}</p>
            <p className="mb-4">{user.bio}</p>
          </div>
          <Avatar className="w-20 h-20 ml-4">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6">
          <button className="hover:underline">
            <span className="font-semibold">{formatNumber(user.followers)}</span>
            <span className="text-muted-foreground ml-1">followers</span>
          </button>
          <button className="hover:underline">
            <span className="font-semibold">{formatNumber(user.following)}</span>
            <span className="text-muted-foreground ml-1">following</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isOwnProfile ? (
            <>
              <Button variant="outline" className="flex-1">
                Edit profile
              </Button>
              <Button variant="outline" className="flex-1">
                Share profile
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleFollow}
                className="flex-1"
                variant={isFollowing ? "outline" : "default"}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button variant="outline" className="flex-1">
                Mention
              </Button>
              <Button variant="outline" size="sm" className="px-3">
                <Share className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="threads" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-transparent border-b border-border rounded-none">
          <TabsTrigger value="threads" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            Threads
          </TabsTrigger>
          <TabsTrigger value="replies" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            Replies
          </TabsTrigger>
          <TabsTrigger value="reposts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            Reposts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="mt-0">
          {userPosts.length > 0 ? (
            <div>
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onProfileClick={handleProfileClick}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No threads yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          <div className="p-8 text-center text-muted-foreground">
            <p>No replies yet</p>
          </div>
        </TabsContent>

        <TabsContent value="reposts" className="mt-0">
          <div className="p-8 text-center text-muted-foreground">
            <p>No reposts yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}