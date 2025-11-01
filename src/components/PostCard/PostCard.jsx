// src/components/PostCard/PostCard.jsx
import { useState, useMemo } from "react";
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function PostCard({ post, onProfileClick }) {
  // Hỗ trợ phẳng là chính, có fallback nếu từng là post.user.*
  const username = post.username ?? post.user?.username ?? "unknown";
  const fullName = post.fullName ?? post.user?.fullName ?? "Unknown";
  const avatarUrl = post.avatarUrl ?? post.user?.avatarUrl ?? "/default-avatar.png";
  const createdAt = post.createdAt ?? post.created_time ?? post.created_at ?? null;
  // lấy media
  const mediaUrl = post.mediaUrl ?? post.imageUrl ?? post.image ?? null;
  const mediaType = post.mediaType ?? post.type ?? null;

  const displayName = fullName || "Unknown";
  const handle = username || "unknown";

  // relative time inline
  const relative = useMemo(() => {
    if (!createdAt) return "now";
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return "now";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }, [createdAt]);

  // local UI state (demo)
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [likes, setLikes] = useState(post.likeCount ?? 0);
  const [reposts, setReposts] = useState(post.repostCount ?? 0);

  const handleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikes((v) => (next ? v + 1 : Math.max(0, v - 1)));
  };

  const handleRepost = () => {
    const next = !isReposted;
    setIsReposted(next);
    setReposts((v) => (next ? v + 1 : Math.max(0, v - 1)));
  };

  const formatNumber = (num) =>
    num >= 1_000_000 ? (num / 1_000_000).toFixed(1) + "M"
    : num >= 1_000 ? (num / 1_000).toFixed(1) + "K"
    : String(num);



  return (
    <div className="border-b border-border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3">
        <button
          className="p-0 h-auto rounded-full"
          onClick={() => onProfileClick?.(handle)}
          title={displayName}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={avatarUrl || "/default-avatar.png"}
              alt={displayName}
              onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
            />
            <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              className="p-0 h-auto hover:underline"
              onClick={() => onProfileClick?.(handle)}
              title={displayName}
            >
              <span className="font-medium">{displayName}</span>
            </button>
            <span className="text-muted-foreground">@{handle}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground" title={createdAt ? new Date(createdAt).toLocaleString() : ""}>
              {relative}
            </span>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" className="p-2 h-auto" aria-label="More">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mb-3">
            <p className="whitespace-pre-wrap">{post.content}</p>

            {/* --- PHẦN MEDIA (ảnh hoặc video) --- */}
            {mediaUrl && (
              <div className="mt-3 flex justify-center">
                {mediaType === "video" ? (
                  <video
                    src={
                      /^https?:\/\//i.test(mediaUrl)
                        ? mediaUrl
                        : `${import.meta.env.VITE_BACKEND_URL || ""}${mediaUrl}`
                    }
                    controls
                    className="block rounded-2xl border border-border/30 object-contain"
                    style={{
                      maxWidth: "min(680px, 90%)",
                      maxHeight: "420px",
                      width: "auto",
                      height: "auto",
                      borderRadius: "22px",
                      backgroundColor: "#000", // nền đen cho video
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <img
                    src={
                      /^https?:\/\//i.test(mediaUrl)
                        ? mediaUrl
                        : `${import.meta.env.VITE_BACKEND_URL || ""}${mediaUrl}`
                    }
                    alt="post media"
                    className="block rounded-2xl border border-border/30 object-contain"
                    style={{
                      maxWidth: "min(680px, 90%)", // không vượt quá 680px
                      maxHeight: "420px",           // giới hạn chiều cao
                      width: "auto",
                      height: "auto",
                      borderRadius: "22px",         // đảm bảo bo góc thật
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between max-w-md">
            <Button variant="ghost" size="sm" className="p-2 h-auto group" aria-label="Comments">
              <MessageCircle className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
              <span className="ml-1 text-sm text-muted-foreground group-hover:text-blue-500">
                {formatNumber(post.commentCount ?? 0)}
              </span>
            </Button>

            <Button variant="ghost" size="sm" className="p-2 h-auto group" onClick={handleRepost} aria-label="Repost">
              <Repeat2 className={`w-5 h-5 ${isReposted ? "text-green-500" : "group-hover:text-green-500"}`} />
              <span className={`ml-1 text-sm ${isReposted ? "text-green-500" : "text-muted-foreground group-hover:text-green-500"}`}>
                {formatNumber(reposts)}
              </span>
            </Button>

            <Button variant="ghost" size="sm" className="p-2 h-auto group" onClick={handleLike} aria-label="Like">
              <Heart className={`w-5 h-5 ${isLiked ? "text-red-500 fill-red-500" : "group-hover:text-red-500"}`} />
              <span className={`ml-1 text-sm ${isLiked ? "text-red-500" : "text-muted-foreground group-hover:text-red-500"}`}>
                {formatNumber(likes)}
              </span>
            </Button>

            <Button variant="ghost" size="sm" className="p-2 h-auto group" aria-label="Share">
              <Share className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
