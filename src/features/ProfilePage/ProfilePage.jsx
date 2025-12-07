import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "../../components/ui/button.js";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.js";
import { MoreHorizontal, Share, Verified, ArrowLeft } from "lucide-react";
import { PostCard } from "../../components/PostCard/PostCard.jsx";
import { ImageViewer } from "../../components/ImageViewer/ImageViewer.jsx";

import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsLoading,
  fetchUserPosts,
  selectUserPosts,
  selectUserPostsLoading,
} from "../../store/postsSlice";

import postApi from "../../api/postApi";
import { EditProfileDialog } from "./EditProfileDialog.jsx";

export function ProfilePage() {
  const { username: rawUsername } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cleanUsername =
    rawUsername && rawUsername.startsWith("@")
      ? rawUsername.substring(1)
      : rawUsername;

  // Lấy thông tin user đã đăng nhập
  const profile = useSelector((s) => s.user.profile) ?? {};
  // Lấy bài viết của chính mình
  const myPosts = useSelector(selectMyPosts);
  const loadingMyPosts = useSelector(selectMyPostsLoading);

  // State lưu bài viết của NGƯỜI KHÁC
  const otherPosts = useSelector(selectUserPosts);
  const loadingOther = useSelector(selectUserPostsLoading);

  // State lưu thông tin profile của NGƯỜI KHÁC
  const [otherProfile, setOtherProfile] = useState(null);

  // State tạm cho nút Follow (UI demo, chưa nối BE)
  const [isFollowing, setIsFollowing] = useState(false);

  // mở avatar bằng ImageViewer
  const [avatarViewerOpen, setAvatarViewerOpen] = useState(false);

  // mở dialog Edit profile
  const [editOpen, setEditOpen] = useState(false);
  const isOwnProfile = !cleanUsername || cleanUsername === profile.userName;
  const user = isOwnProfile
    ? {
        id: profile.id,
        displayName: profile.fullName ?? "Unknown",
        username: profile.userName ?? "unknown",
        bio: profile.bio ?? "",
        avatar: profile.avatarUrl ?? "/default-avatar.png",
        followers: profile.followersCount ?? 0,
        following: profile.followingCount ?? 0,
        verified: profile.verified ?? false,
      }
    : otherProfile
    ? {
        id: otherProfile.id,
        displayName: otherProfile.fullName ?? "Unknown",
        username: otherProfile.userName ?? "unknown",
        bio: otherProfile.bio ?? "",
        avatar: otherProfile.avatarUrl ?? "/default-avatar.png",
        followers: otherProfile.followersCount ?? 0,
        following: otherProfile.followingCount ?? 0,
        verified: otherProfile.verified ?? false,
      }
    : null;

  // LẤY BÀI VIẾT + PROFILE
  useEffect(() => {
    if (isOwnProfile) {
      dispatch(fetchMyPosts());
    }
    else if (cleanUsername) {
      (async () => {
        try {
          // dùng cleanUsername (không có @) để gọi BE
          dispatch(fetchUserPosts({ username: cleanUsername }));
          const userRes = await postApi.getUserByUsername(cleanUsername);
          setOtherProfile(userRes.result);
        } catch (err) {
          console.error("Error loading profile:", err);
        }
      })();
    }
  }, [dispatch, isOwnProfile, cleanUsername]);

  // Hàm khi click vào avatar/username trong PostCard
  const handleProfileClick = (username) => {
    navigate(`/profile/@${username}`);
  };

  // Back lại feed
  const handleBack = () => {
    navigate("/feed");
  };

  // Format số follower/following cho đẹp (1.2K, 3.4M,...)
  const formatNumber = (num) => {
    if (!num) return 0;
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  // Toggle Follow/Following
  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  // Chọn bài viết để render
  const postsToRender = isOwnProfile ? myPosts : otherPosts;
  if (!user && (isOwnProfile ? loadingMyPosts : loadingOther)) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải profile...
      </div>
    );
  }

  // Mở bài viết trong PostDetailPage
  const handleOpenPost = (id) => {
    if (!id) return;
    navigate(`/post/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header cố định trên cùng */}
      <div className="border-b border-border p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user?.displayName}</h2>
            <p className="text-sm text-muted-foreground">
              {postsToRender?.length || 0} threads
            </p>
          </div>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Phần info profile (avatar, name, bio, stats, nút ...) */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{user?.displayName}</h1>
              {user?.verified && (
                <Verified className="w-6 h-6 text-blue-500 fill-blue-500" />
              )}
            </div>
            <p className="text-muted-foreground mb-1">@{user?.username}</p>
            <p className="mb-4">{user?.bio}</p>
          </div>
          <button
            className="p-0 rounded-full cursor-pointer hover:opacity-80 transition"
            onClick={() => {
              if (user?.avatar) setAvatarViewerOpen(true);
            }}
            title="Xem ảnh đại diện"
          >
            <Avatar className="w-20 h-20 ml-4">
              <AvatarImage
                src={user?.avatar || "/default-avatar.png"}
                alt={user?.displayName}
                onError={(e) => {
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />
              <AvatarFallback className="text-2xl">
                {user?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>

        {/* Stats followers / following */}
        <div className="flex items-center gap-6 mb-6">
          <button className="hover:underline">
            <span className="font-semibold">
              {formatNumber(user?.followers)}
            </span>
            <span className="text-muted-foreground ml-1">followers</span>
          </button>
          <button className="hover:underline">
            <span className="font-semibold">
              {formatNumber(user?.following)}
            </span>
            <span className="text-muted-foreground ml-1">following</span>
          </button>
        </div>

        {/* Nút action: nếu là mình -> Edit/Share, nếu là người khác -> Follow/Mention/... */}
        <div className="flex gap-3">
          {isOwnProfile ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditOpen(true)}
              >
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

      {/* Tabs Threads / Replies / Reposts */}
      <Tabs defaultValue="threads" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-transparent border-b border-border rounded-none">
          <TabsTrigger
            value="threads"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Threads
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Replies
          </TabsTrigger>
          <TabsTrigger
            value="reposts"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            Reposts
          </TabsTrigger>
        </TabsList>

        {/* Tab Threads: hiển thị danh sách bài viết */}
        <TabsContent value="threads" className="mt-0">
          {(isOwnProfile && loadingMyPosts) || (!isOwnProfile && loadingOther) ? (
            <div className="p-8 text-center text-muted-foreground">
              Đang tải threads...
            </div>
          ) : postsToRender?.length > 0 ? (
            <div>
              {postsToRender.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onProfileClick={handleProfileClick}
                  onPostClick={handleOpenPost}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No threads yet
            </div>
          )}
        </TabsContent>

        {/* Tab Replies (chưa làm, để placeholder) */}
        <TabsContent value="replies" className="mt-0">
          <div className="p-8 text-center text-muted-foreground">
            No replies yet
          </div>
        </TabsContent>

        {/* Tab Reposts (chưa làm, để placeholder) */}
        <TabsContent value="reposts" className="mt-0">
          <div className="p-8 text-center text-muted-foreground">
            No reposts yet
          </div>
        </TabsContent>
      </Tabs>

      {/* ImageViewer để xem ảnh đại diện */}
      <ImageViewer
        open={avatarViewerOpen}
        onClose={() => setAvatarViewerOpen(false)}
        mediaList={[{ mediaUrl: user?.avatar, mediaType: "image" }]}
        index={0}
      />

      {/* Dialog Edit Profile riêng */}
      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
