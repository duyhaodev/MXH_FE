// src/features/FeedPage/components/CreatePost.jsx
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogDescription } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Image as ImageIcon, Smile, AtSign, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import { createPost, selectPostsCreating } from "../../../store/postsSlice";

export function CreatePost({ open, onOpenChange }) {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.user.profile) ?? {};
  const displayName = profile.fullName ?? "Unknown";
  const username = profile.userName ?? "unknown";
  const avatar = profile.avatar ?? null;
  const creating = useSelector(selectPostsCreating);

  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaKind, setMediaKind] = useState(null);
  const fileInputRef = useRef(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef(null);

  // cleanup preview khi unmount
  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  // đóng emoji khi click ra ngoài
  useEffect(() => {
    if (!emojiOpen) return;
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiOpen]);

  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type || "";
    const isImage = type.startsWith("image/");
    const isVideo = type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Chỉ được chọn file hình ảnh hoặc video!");
      return;
    }
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(file);
    setMediaKind(isImage ? "image" : "video");
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaKind(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    const trimContent = (content || "").trim();
    if (!trimContent && !mediaFile) return;

    const fd = new FormData();
    if (trimContent) fd.append("content", trimContent);
    if (mediaFile) fd.append("image", mediaFile);

    const action = await dispatch(createPost(fd));
    if (createPost.fulfilled.match(action)) {
      toast.success("Đăng bài thành công!");
      setContent("");
      handleRemoveFile();
      setEmojiOpen(false);
      onOpenChange(false);
    } else {
      toast.error(action.payload?.message || "Đăng bài thất bại!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onOpenChange(false) : onOpenChange(true))}>
      <DialogContent
        className="max-w-[420px] p-0 gap-0 bg-[#181818] border-[#2a2a2a] [&>button]:hidden"
        aria-describedby="dialog-description"
      >
        <DialogDescription id="dialog-description" className="sr-only">
          Tạo thread mới với nội dung, emoji và các tùy chọn kiểm soát
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <Button
            variant="ghost"
            onClick={() => {
              setEmojiOpen(false);
              onOpenChange(false);
            }}
            className="h-auto p-0 hover:bg-transparent cursor-pointer"
          >
            Hủy
          </Button>
          <h2 className="font-semibold">Thread mới</h2>
          <div className="w-16"></div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              {avatar ? (
                <AvatarImage src={avatar} alt={displayName} />
              ) : (
                <AvatarFallback>{(displayName || "U").charAt(0)}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <div className="mb-1">
                  <span className="font-semibold">@{username}</span>
                </div>

                <Textarea
                  placeholder="What's new?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[25px] resize-none border-none p-0 focus-visible:ring-0 text-base bg-transparent placeholder:text-muted-foreground w-full max-w-full"
                  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                  maxLength={500}
                  autoFocus
                />
              </div>

              {/* Tools */}
              <div className="mt-3 flex items-center gap-3 relative">
                {/* Chọn ảnh/video */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={onFileChange}
                />

                {/* Mention */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-auto text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <AtSign className="w-5 h-5" />
                </Button>

                {/* Emoji */}
                <div className="relative" ref={emojiRef}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => setEmojiOpen((v) => !v)}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>

                  {emojiOpen && (
                    <div className="absolute left-0 top-9 z-50 w-72 rounded-xl border border-border bg-[#111] shadow-lg">
                      <EmojiPicker
                        theme="dark"
                        width="100%"
                        height={400}
                        emojiStyle="native"
                        searchDisabled
                        previewConfig={{ showPreview: false }}
                        onEmojiClick={handleEmojiClick}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Media preview */}
              {mediaPreview && (
                <div className="relative mt-3 inline-block">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 rounded-full p-1"
                    title="Gỡ media"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  {mediaKind === "video" ? (
                    <video
                      src={mediaPreview}
                      controls
                      preload="metadata"
                      className="block rounded-xl border border-border/30 max-h-[320px] object-contain z-10"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="preview"
                      className="block rounded-xl border border-border/30 max-h-[320px] object-contain z-10"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#2a2a2a] flex items-center justify-between">
          <span className={`text-sm ${content.length > 450 ? "text-red-500" : "text-muted-foreground"}`}>
            {content.length}/500
          </span>
          <Button
            onClick={handleSubmit}
            disabled={creating || (!content.trim() && !mediaFile)}
            size="sm"
            className="px-6 cursor-pointer"
          >
            {creating ? "Đang đăng..." : "Đăng"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePost;
