// src/components/PostCard/PostCard.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ImageViewer } from "../ImageViewer/ImageViewer.jsx";
import likeApi from "@/api/likeApi";

export function PostCard({ post, onProfileClick, onPostClick }) {
  const username = post.username ?? post.user?.username ?? "unknown";
  const fullName = post.fullName ?? post.user?.fullName ?? "Unknown";
  const avatarUrl = post.avatarUrl ?? post.user?.avatarUrl;
  const createdAt = post.createdAt ?? post.created_time ?? post.created_at ?? null;

  // list media từ BE
  const mediaList = Array.isArray(post.mediaList) ? post.mediaList : [];
  const mediaCount = mediaList.length;

  const displayName = fullName || "Unknown";
  const handle = username || "unknown";

  // click mở fullscreen
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // relative time inline (ngắn gọn)
  const relative = useMemo(() => {
    if (!createdAt) return "now";
    const diff = (Date.now() - new Date(createdAt)) / 60000; // phút
    if (diff < 1) return "now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  }, [createdAt]);

  // local UI state (demo)
  const [isLiked, setIsLiked] = useState(
    post.liked ?? post.likedByCurrentUser ?? post.isLikedByCurrentUser ?? false
  );
  const [likes, setLikes] = useState(post.likeCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [reposts, setReposts] = useState(post.repostCount ?? 0);

  useEffect(() => {
    setIsLiked(
      post.liked ?? post.likedByCurrentUser ?? post.isLikedByCurrentUser ?? false
    );
    setLikes(post.likeCount ?? 0);
  }, [post.liked, post.likedByCurrentUser, post.isLikedByCurrentUser, post.likeCount]);

  const handleLike = async () => {
    if (liking) return;

    const id = post.id ?? post.postId;
    if (!id) return;

    // optimistic update
    const prevLiked = isLiked;
    const prevLikes = likes;
    const nextLiked = !isLiked;
    const nextLikes = nextLiked
      ? prevLikes + 1
      : Math.max(0, prevLikes - 1);

    setIsLiked(nextLiked);
    setLikes(nextLikes);
    setLiking(true);

    try {
      const res = await likeApi.togglePost(id);

      if (typeof res?.liked === "boolean") {
        setIsLiked(res.liked);
      }
      if (typeof res?.likeCount === "number") {
        setLikes(res.likeCount);
      }
    } catch (err) {
      console.error("Toggle like failed:", err);
      setIsLiked(prevLiked);
      setLikes(prevLikes);
    } finally {
      setLiking(false);
    }
  };

  const handleRepost = () => {
    const next = !isReposted;
    setIsReposted(next);
    setReposts((v) => (next ? v + 1 : Math.max(0, v - 1)));
  };

  const formatNumber = (num) =>
    num >= 1_000_000
      ? (num / 1_000_000).toFixed(1) + "M"
      : num >= 1_000
      ? (num / 1_000).toFixed(1) + "K"
      : String(num);

  // Hàm mở trang chi tiết bài viết
  const handleOpenPost = () => {
    const id = post.id ?? post.postId;
    if (!id) return;
    onPostClick?.(id);
  };

  // kích thước item khi nhiều media:
  const multiSize = useMemo(() => {
    if (mediaCount <= 1) return null;
    if (mediaCount === 2) return { width: 250, height: 300 };
    return { width: 180, height: 250 }; // 3 media trở lên
  }, [mediaCount]);

  // ----- drag-to-scroll -----
  const mediaScrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false); // flag phân biệt drag vs click

  useEffect(() => {
    const handleUp = () => {
      const el = mediaScrollRef.current;
      if (!isDraggingRef.current || !el) return;
      isDraggingRef.current = false;
      el.classList.remove("cursor-grabbing");
    };

    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mouseleave", handleUp);

    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseleave", handleUp);
    };
  }, []);

  const handleMediaMouseDown = (e) => {
    if (!mediaScrollRef.current) return;
    if (e.button !== 0) return; // chỉ chuột trái

    const el = mediaScrollRef.current;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    el.classList.add("cursor-grabbing");

    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMediaMouseMove = (e) => {
    const el = mediaScrollRef.current;
    if (!isDraggingRef.current || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true; // lệch > 5px thì là kéo
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  // ----- AUTO PLAY / PAUSE VIDEO -----
  const cardRef = useRef(null);
  useEffect(() => {
    const root = cardRef.current;
    if (!root) return;

    const videos = root.querySelectorAll("video[data-autoplay]");
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: [0, 0.7, 1] }
    );

    videos.forEach((el) => {
      el.muted = true;
      el.playsInline = true;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mediaCount]);

  // ================= RENDER =================
  return (
    <div
      ref={cardRef}
      className="border-b border-border p-4 hover:bg-muted/50 transition-colors"
    >
      <style>
        {`
          .post-media-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .post-media-scroll::-webkit-scrollbar {
            display: none;
          }

          .post-media-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            background-color: #000;
          }
          .post-media-video:fullscreen,
          .post-media-video:-webkit-full-screen {
            object-fit: contain;
            background-color: #000;
          }
        `}
      </style>

      <div className="flex items-start gap-3">
        {/* Avatar + click vào profile */}
        <button
          className="p-0 h-auto rounded-full"
          onClick={() => onProfileClick?.(handle)}
          title={displayName}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </button>

        {/* Xem chi tiết bài viết */}
        <div
          className={`flex-1 min-w-0 ${onPostClick ? "cursor-pointer" : ""}`}
          onClick={onPostClick ? handleOpenPost : undefined}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <button
              className="p-0 h-auto hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick?.(handle);
              }}
              title={displayName}
            >
              <span className="font-medium">{displayName}</span>
            </button>
            <span className="text-muted-foreground">@{handle}</span>
            <span className="text-muted-foreground">·</span>
            <span
              className="text-muted-foreground"
              title={createdAt ? new Date(createdAt).toLocaleString() : ""}
            >
              {relative}
            </span>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-auto"
                aria-label="More"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content + media */}
          <div className="mb-3">
            {/* Nhấn vào text cũng mở chi tiết */}
            <p className="whitespace-pre-wrap">
              {post.content}
            </p>

            {/* -------- PHẦN MEDIA -------- */}
            {mediaCount > 0 && (
              <div className="mt-3 flex justify-center">
                {mediaCount === 1 ? (
                  // ======= 1 MEDIA =======
                  (() => {
                    const m = mediaList[0];
                    const url = /^https?:\/\//i.test(m.mediaUrl)
                      ? m.mediaUrl
                      : `${import.meta.env.VITE_BACKEND_URL || ""}${m.mediaUrl}`;

                    if (m.mediaType === "video") {
                      return (
                        <video
                          src={url}
                          loop
                          data-autoplay
                          className="rounded-2xl border border-border/30 object-contain"
                          style={{
                            maxWidth: "min(680px, 90%)",
                            maxHeight: "420px",
                            width: "auto",
                            height: "auto",
                            backgroundColor: "#000",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewerIndex(0);
                            setViewerOpen(true);
                          }}
                        />
                      );
                    }

                    return (
                      <img
                        src={url}
                        className="rounded-2xl border border-border/30 object-contain"
                        style={{
                          maxWidth: "min(680px, 90%)",
                          maxHeight: "420px",
                          width: "auto",
                          height: "auto",
                        }}
                        loading="lazy"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewerIndex(0);
                          setViewerOpen(true);
                        }}
                      />
                    );
                  })()
                ) : (
                  // ======= NHIỀU MEDIA (2+) =======
                  <div className="w-full flex justify-center">
                    <div className="relative w-full max-w-[680px]">
                      <div
                        ref={mediaScrollRef}
                        onMouseDown={handleMediaMouseDown}
                        onMouseMove={handleMediaMouseMove}
                        onDragStart={(e) => e.preventDefault()}
                        className="post-media-scroll overflow-x-auto cursor-grab py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-3 w-max mx-auto px-2">
                          {mediaList.map((m, idx) => {
                            const url = /^https?:\/\//i.test(m.mediaUrl)
                              ? m.mediaUrl
                              : `${import.meta.env.VITE_BACKEND_URL || ""}${m.mediaUrl}`;
                            const isVideo = m.mediaType === "video";

                            return (
                              <div
                                key={m.id ?? idx}
                                className="relative flex-shrink-0 rounded-2xl overflow-hidden border border-border/30 bg-black"
                                style={{
                                  width: multiSize?.width ?? 240,
                                  height: multiSize?.height ?? 340,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasDraggedRef.current) return;
                                  setViewerIndex(idx);
                                  setViewerOpen(true);
                                }}
                              >
                                {isVideo ? (
                                  <video
                                    src={url}
                                    loop
                                    data-autoplay
                                    className="post-media-video rounded-2xl"
                                  />
                                ) : (
                                  <img
                                    src={url}
                                    className="w-full h-full object-cover rounded-2xl"
                                    loading="lazy"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* -------- END MEDIA -------- */}
          </div>

          {/* Actions: comment / repost / like / share */}
          <div className="flex items-center justify-between max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto group"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              aria-label="Like"
              disabled={liking}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "text-red-500 fill-red-500" : "group-hover:text-red-500"
                }`}
              />
              <span
                className={`ml-1 text-sm ${
                  isLiked ? "text-red-500" : "text-muted-foreground group-hover:text-red-500"
                }`}
              >
                {formatNumber(likes)}
              </span>
            </Button>

            {/* Comment: mở chi tiết bài viết */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto group"
              aria-label="Comments"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPost();
              }}
            >
              <MessageCircle className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
              <span className="ml-1 text-sm text-muted-foreground group-hover:text-blue-500">
                {formatNumber(post.commentCount ?? 0)}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto group"
              onClick={(e) => {
                e.stopPropagation(); 
                handleRepost();
              }}
              aria-label="Repost"
            >
              <Repeat2
                className={`w-5 h-5 ${
                  isReposted ? "text-green-500" : "group-hover:text-green-500"
                }`}
              />
              <span
                className={`ml-1 text-sm ${
                  isReposted
                    ? "text-green-500"
                    : "text-muted-foreground group-hover:text-green-500"
                }`}
              >
                {formatNumber(reposts)}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto group"
              aria-label="Share"
              onClick={(e) => e.stopPropagation()}
            >
              <Share className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
            </Button>
          </div>
        </div>
      </div>

      {/* ===== FULLSCREEN VIEWER ===== */}
      <ImageViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        mediaList={mediaList}
        index={viewerIndex}
      />
    </div>
  );
}
