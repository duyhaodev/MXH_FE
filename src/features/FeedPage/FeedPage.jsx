import { useState } from "react";
import { Button } from "../../components/ui/button.js";
import { Textarea } from "../../components/ui/textarea.js";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar.js";
import { Image, Smile, AtSign } from "lucide-react";
import { PostCard } from "../../components/PostCard/PostCard.jsx";
import { mockPosts, currentUser } from "../../data/mockData.js";

export function FeedPage({ onProfileClick }) {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState(mockPosts);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const newPostData = {
      id: Date.now().toString(),
      author: currentUser,
      content: newPost,
      timestamp: "now",
      likes: 0,
      replies: 0,
      reposts: 0,
      isLiked: false,
      isReposted: false,
    };

    setPosts([newPostData, ...posts]);
    setNewPost("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-border p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl font-semibold">Home</h2>
      </div>

      {/* Create Post */}
      <div className="border-b border-border p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
            <AvatarFallback>{currentUser.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="What's new?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px] resize-none text-base w-full"
              maxLength={500}
              style={{
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            />
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="p-2 h-auto text-muted-foreground hover:text-foreground">
                  <Image className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 h-auto text-muted-foreground hover:text-foreground">
                  <Smile className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 h-auto text-muted-foreground hover:text-foreground">
                  <AtSign className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {newPost.length}/500
                </span>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  size="sm"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onProfileClick={onProfileClick}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="p-4 text-center">
        <Button variant="ghost" className="text-muted-foreground">
          Load more posts
        </Button>
      </div>
    </div>
  );
}