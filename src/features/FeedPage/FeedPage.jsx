import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.js";
import { Textarea } from "../../components/ui/textarea.js";
import { Avatar, AvatarFallback } from "../../components/ui/avatar.js";
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
import { X } from "lucide-react";

export function FeedPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const posts = useSelector(selectPosts);
  const hasMore = useSelector(selectPostsHasMore);
  const loading = useSelector(selectPostsLoading);
  const creating = useSelector(selectPostsCreating);
  const page = useSelector(selectPostsPage);

  const [newPost, setNewPost] = useState("");
  const [mediaFile, setMediaFile] = useState(null);         
  const [mediaPreview, setMediaPreview] = useState(null);   
  const [mediaKind, setMediaKind] = useState(null);        
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchFeed({ page: 0, size: 20 }))
      .unwrap()
      .catch(() => toast.error("Không tải được feed"));
  }, [dispatch]);

  // mở hộp chọn media (ảnh hoặc video)
  const openFilePicker = useCallback(() => fileInputRef.current?.click(), []);

  // khi chọn file xong
  const onFileChange = (e) => {
    const file = e.target.files?.[0]; //Nếu chọn nhiều thì lấy file đầu tiên
    if (!file) return;
    const type = file.type || "";
    const isImage = type.startsWith("image/");
    const isVideo = type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Chỉ được chọn file hình ảnh hoặc video!");
      return;
    }
    // cleanup URL cũ nếu có
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(file);
    setMediaKind(isImage ? "image" : "video");
    setMediaPreview(URL.createObjectURL(file));
  };

  // cleanup preview khi component unmount
  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleCreatePost = async () => {
    const content = (newPost || "").trim();
    if (!content && !mediaFile) return;

    const fd = new FormData();
    if (content) fd.append("content", content);
    if (mediaFile) fd.append("image", mediaFile);

    const action = await dispatch(createPost(fd));   // gọi createPost
    if (createPost.fulfilled.match(action)) {
      toast.success("Đăng bài thành công");
      setNewPost("");
      setMediaFile(null);
      if (mediaPreview) URL.revokeObjectURL(mediaPreview); // Giải phóng URL blob cũ khỏi bộ nhớ (tránh rò rỉ RAM)
      setMediaPreview(null);
      setMediaKind(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // cho phép chọn lại cùng 1 file
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

            {/* Preview media nếu có */}
            {mediaPreview && (
              <div className="mt-3 flex justify-center">
                {/* relative inline-block đảm bảo nút X nằm trên media */}
                <div className="relative inline-block align-top">
                  {mediaKind === "video" ? (
                    <video
                      src={mediaPreview}
                      controls
                      className="rounded-2xl border border-border/30 object-contain"
                      style={{
                        maxWidth: "min(750px, 90%)",
                        maxHeight: "500px",
                        width: "auto",
                        height: "auto",
                        display: "block",
                        borderRadius: "22px",
                        backgroundColor: "#000",
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="preview"
                      className="rounded-2xl border border-border/30 object-contain"
                      style={{
                        maxWidth: "min(750px, 90%)",
                        maxHeight: "500px",
                        width: "auto",
                        height: "auto",
                        display: "block",
                        borderRadius: "22px",
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    />
                  )}
                  {/* Nút X */}
                  <button
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview(null);
                      setMediaKind(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1 transition"
                    style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 9999 }}
                    title="Gỡ media"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Input file ẩn */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={onFileChange}
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto text-muted-foreground hover:text-foreground"
                  onClick={openFilePicker}
                >
                  <Image className="w-5 h-5" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="p-2 h-auto text-muted-foreground hover:text-foreground">
                  <Smile className="w-5 h-5" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="p-2 h-auto text-muted-foreground hover:text-foreground">
                  <AtSign className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{newPost.length}/500</span>
                <Button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={creating || (!newPost.trim() && !mediaFile)}
                  size="sm"
                >
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
                mediaUrl,
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
