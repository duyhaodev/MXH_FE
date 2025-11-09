import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
import EmojiPicker from "emoji-picker-react"; 

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

  const [showEmoji, setShowEmoji] = useState(false);            // bật/tắt picker
  const textareaRef = useRef(null);                             // để chèn emoji đúng vị trí con trỏ
  const emojiPopoverRef = useRef(null);                         // click outside để đóng
  const emojiButtonWrapRef = useRef(null);
  const emojiPortalRef = useRef(null);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

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

    const action = await dispatch(createPost(fd));  // gọi createPost
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

  // helper: chèn emoji tại vị trí con trỏ
  const insertAtCursor = useCallback((emoji) => {
    const el = textareaRef.current;
    if (!el) {
      setNewPost((prev) => prev + emoji);
      return;
    }
    const start = el.selectionStart ?? newPost.length;
       const end = el.selectionEnd ?? newPost.length;
    const before = newPost.slice(0, start);
    const after = newPost.slice(end);
    const next = before + emoji + after;
    setNewPost(next);

    // đưa lại caret sau emoji
    const newPos = start + emoji.length;
    // delay 1 tick để React render xong
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  }, [newPost]);

  // khi chọn emoji
  const handleEmojiClick = (emojiData) => {
    insertAtCursor(emojiData.emoji);
    setShowEmoji(false); // đóng sau khi chọn
  };

  // đóng popover khi bấm ra ngoài hoặc Escape
  useEffect(() => {
    if (!showEmoji) return;
    const onClickOutside = (e) => {
      // Bỏ qua click nếu nằm trong Portal hoặc vùng bọc nút emoji
      if (
        (emojiPortalRef.current && emojiPortalRef.current.contains(e.target)) ||
        (emojiButtonWrapRef.current && emojiButtonWrapRef.current.contains(e.target))
      ) {
        return;
      }
      if (emojiPopoverRef.current && !emojiPopoverRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShowEmoji(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [showEmoji]);

  // Mở picker bằng Portal (toạ độ theo nút emoji)
  const openEmojiPortal = () => {
    const host = emojiButtonWrapRef.current;
    if (!host) return;
    const r = host.getBoundingClientRect();
    const approxWidth = 360; 
    const left = Math.max(8, Math.min(r.left, window.innerWidth - approxWidth - 8));
    setPickerPos({ top: r.bottom + 8, left });
    setShowEmoji(true);
  };

  // click-outside cho Portal
  useEffect(() => {
    if (!showEmoji) return;
    const onDown = (e) => {
      if (
        emojiPortalRef.current?.contains(e.target) ||
        emojiButtonWrapRef.current?.contains(e.target)
      ) return;
      setShowEmoji(false);
    };
    const onKey = (e) => e.key === "Escape" && setShowEmoji(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [showEmoji]);

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

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}     // ref để chèn emoji theo caret
              placeholder="What's new?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px] resize-none text-base w-full"
              maxLength={500}
            />

            {/* Preview media nếu có */}
            {mediaPreview && (
              <div className="mt-3 flex justify-center">
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

                {/* Nút mở Emoji + Popover */}
                <div className="relative" ref={emojiPopoverRef}> 
                  <div className="inline-block" ref={emojiButtonWrapRef}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-haspopup="dialog"
                      aria-expanded={showEmoji}
                      className="p-2 h-auto text-muted-foreground hover:text-foreground"
                      onClick={() => (showEmoji ? setShowEmoji(false) : openEmojiPortal())}       // toggle picker
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
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

      {/* Render EmojiPicker ở đây để tránh đẩy layout */}
      {showEmoji &&
        createPortal(
          <div
            ref={emojiPortalRef}
            style={{
              position: "fixed",
              top: pickerPos.top,
              left: pickerPos.left,
              zIndex: 9999,
            }}
            onMouseDown={(e) => e.stopPropagation()} // chặn nổi bọt click trong picker
          >
            <div
              style={{
                borderRadius: 12,
                boxShadow: "0 16px 48px rgba(0,0,0,.45)",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}  // chọn emoji -> chèn vào caret
                theme="dark"
                searchDisabled={false}
                skinTonesDisabled={false}
                reactionsDefaultOpen={false}
                lazyLoadEmojis
              />
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}
