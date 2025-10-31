import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Textarea } from "../../components/ui/textarea.js";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar.js";
import { Image, Smile, AtSign } from "lucide-react";
import { PostCard } from "../../components/PostCard/PostCard.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFeed,
  createPost,
  selectPosts,
  selectPostsHasMore,
  selectPostsLoading,
  selectPostsCreating,
  selectPostsPage,
} from "../../store/postsSlice";
import { toast } from "sonner";

export function FeedPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const posts = useSelector(selectPosts);
  const hasMore = useSelector(selectPostsHasMore);
  const loading = useSelector(selectPostsLoading);
  const creating = useSelector(selectPostsCreating);
  const page = useSelector(selectPostsPage);

  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    dispatch(fetchFeed({ page: 0, size: 20 }))
      .unwrap()
      .catch(() => toast.error("Không tải được feed"));
  }, [dispatch]);

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleCreatePost = async () => {
    const content = (newPost || "").trim();
    if (!content) return;

    const payload = { content, mediaUrl: null, mediaType: null, scope: "public" };
    const action = await dispatch(createPost(payload));

    if (createPost.fulfilled.match(action)) {
      toast.success("Đăng bài thành công");
      setNewPost("");
    } else {
      toast.error(action.payload?.message || "Đăng bài thất bại");
    }
  };

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    dispatch(fetchFeed({ page, size: 20 }))
      .unwrap()
      .catch(() => toast.error("Không tải được feed"));
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
            {/* TODO: thay bằng avatar người đang login nếu có */}
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's new?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px] resize-none text-base w-full"
              maxLength={500}
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
                <span className="text-sm text-muted-foreground">{newPost.length}/500</span>
                <Button onClick={handleCreatePost} disabled={creating || !newPost.trim()} size="sm">
                  {creating ? "Đang đăng..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div>
        {posts.map((post) => {
          const username = post.username ?? post.user?.username ?? "unknown";
          const fullName = post.fullName ?? post.user?.fullName ?? "User";
          const avatarUrl = post.avatarUrl ?? post.user?.avatarUrl ?? "/default-avatar.png";
          const createdAt = post.createdAt ?? post.created_time ?? post.created_at;
          const mediaUrl = post.mediaUrl ?? post.imageUrl ?? post.image ?? post.media?.url ?? null;

          return (
            <PostCard
              key={post.id}
              post={{
                ...post,
                username,
                fullName,
                avatarUrl,
                createdAt,
                mediaUrl
              }}
              onProfileClick={handleProfileClick}
            />
          );
        })}
      </div>

      {/* Load More */}
      <div className="p-4 text-center">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={handleLoadMore}
          disabled={!hasMore || loading}
        >
          {loading ? "Đang tải..." : hasMore ? "Load more posts" : "Hết bài"}
        </Button>
      </div>
    </div>
  );
}
