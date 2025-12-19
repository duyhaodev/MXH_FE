import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  Verified,
  Check,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import notificationApi from "../../api/notificationApi";
import { resetUnreadCount } from "../../store/notificationsSlice";
import { formatTimeAgo } from '../../utils/dateUtils';

export function ActivityPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onProfileClick = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const onPostClick = (postId) => {
    if (postId) {
      navigate(`/post/${postId}`);
    }
  };

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // map tab -> backend type
  const typeMap = {
    all: ["all"],
    comments: ["comment_post"],
    likes: ["like_post", "like_comment"],
    reposts: ["repost"],
    follows: ["follow"],
  };

  // Helper để fetch activities (tái sử dụng cho refetch)
  const fetchActivities = useCallback(async (tabType = activeTab) => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications({
        type: tabType === "likes" ? undefined : typeMap[tabType],
        limit: 20,
      });
      setActivities(res?.activities || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchActivities();
    // Reset unread count when viewing activity page
    dispatch(resetUnreadCount());
  }, [fetchActivities, dispatch]);

  const commentActivities = useMemo(
    () => activities.filter((a) => a.type === "comment_post"),
    [activities]
  );

  const likeActivities = useMemo(
    () => activities.filter((a) => a.type === "like_post" || a.type === "like_comment"),
    [activities]
  );

  const repostActivities = useMemo(
    () => activities.filter((a) => a.type === "repost"),
    [activities]
  );

  const followActivities = useMemo(
    () => activities.filter((a) => a.type === "follow"),
    [activities]
  );

  const handleFollowBack = async (notificationId) => {
    // Optimistic update: Đánh dấu ngay lập tức để UI mượt
    setActivities((prev) =>
      prev.map((a) =>
        a.id === notificationId 
          ? { ...a, read: true, followed: true }  // Thêm field 'followed' để ẩn button
          : a
      )
    );

    try {
      await notificationApi.followBack(notificationId);
      // Refetch để đồng bộ với backend (an toàn hơn)
      await fetchActivities(activeTab);
      toast.success("Đã follow thành công!");
    } catch (err) {
      // Revert optimistic update nếu fail
      await fetchActivities(activeTab);
      toast.error(err.response?.data?.error || "Lỗi follow back!");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading activities...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b p-4 sticky top-0 bg-background z-10">
        <h2 className="text-xl">Activity</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="all" className="px-6 py-3">
            All
          </TabsTrigger>
          <TabsTrigger value="comments" className="px-6 py-3">
            Comments
          </TabsTrigger>
          <TabsTrigger value="likes" className="px-6 py-3">
            Likes
          </TabsTrigger>
          <TabsTrigger value="reposts" className="px-6 py-3">
            Reposts
          </TabsTrigger>
          <TabsTrigger value="follows" className="px-6 py-3">
            Follows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderActivities(activities, onProfileClick, onPostClick, handleFollowBack)}
        </TabsContent>

        <TabsContent value="comments">
          {renderActivities(commentActivities, onProfileClick, onPostClick, handleFollowBack)}
        </TabsContent>

        <TabsContent value="likes">
          {renderActivities(likeActivities, onProfileClick, onPostClick, handleFollowBack)}
        </TabsContent>

        <TabsContent value="reposts">
          {renderActivities(repostActivities, onProfileClick, onPostClick, handleFollowBack)}
        </TabsContent>

        <TabsContent value="follows">
          {renderActivities(followActivities, onProfileClick, onPostClick, handleFollowBack)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================= Helpers ================= */

function renderActivities(list, onProfileClick, onPostClick, onFollowBack) {
  if (!list.length) {
    return <EmptyState message="No activities yet" />;
  }

  return list.map((activity) => (
    <ActivityItem
      key={activity.id}
      activity={activity}
      onProfileClick={onProfileClick}
      onPostClick={onPostClick}
      onFollowBack={onFollowBack}
    />
  ));
}

function ActivityItem({ activity, onProfileClick, onPostClick, onFollowBack }) {
  const iconMap = {
    like_post: <Heart className="w-4 h-4 text-red-500 fill-red-500" />,
    like_comment: <Heart className="w-4 h-4 text-red-500 fill-red-500" />,
    comment_post: <MessageCircle className="w-4 h-4 text-blue-500" />,
    repost: <Repeat2 className="w-4 h-4 text-green-500" />,
    follow: <UserPlus className="w-4 h-4 text-purple-500" />,
  };

  // Kiểm tra trạng thái đã follow để ẩn button (ưu tiên từ backend)
  const isFollowed = activity.followed === true;

  const dateText = formatTimeAgo(activity.timestamp);

  // Logic để chọn icon phù hợp
  let icon = iconMap[activity.type];

  // Kiểm tra nếu activity có postId để click xem chi tiết
  const hasPostLink = activity.postId && (activity.type === "like_post" || activity.type === "comment_post" || activity.type === "repost" || activity.type === "like_comment");
  console.log('Rendering activity:', activity);
  return (
    <div
      className={`border-b p-4 hover:bg-muted/50 transition-colors ${
        !activity.read ? "bg-muted/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-2">
            {/* Avatar with icon badge */}
            <div className="relative flex-shrink-0">
              <button
                className="p-0 h-auto rounded-full"
                onClick={() => onProfileClick?.(activity.user?.username)}
                title={activity.user?.displayName}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activity.user?.avatar} alt={activity.user?.displayName} />
                  <AvatarFallback>{activity.user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </button>
              {icon && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5 border border-background shadow-sm">
                  {icon}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto hover:underline"
                  onClick={() => onProfileClick?.(activity.user?.username)}
                >
                  <span className="font-medium">{activity.user?.displayName || "Unknown User"}</span>
                </Button>
                {activity.user?.verified && (
                  <Verified className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />
                )}
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  {dateText}
                </span>
              </div>

              {hasPostLink ? (
                <button
                  className="block w-full text-left hover:underline focus:outline-none"
                  onClick={() => onPostClick?.(activity.postId)}
                >
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.message}
                  </p>
                </button>
              ) : (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {activity.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center flex-shrink-0">
          {activity.type === "follow" && !isFollowed && onFollowBack && (
            <Button
              size="default"
              variant="outline"
              onClick={() => onFollowBack(activity.id)}
              className="min-w-[100px]"
            >
              Follow
            </Button>
          )}
          {isFollowed && activity.type === "follow" && (
            <Button
              size="default"
              variant="secondary"
              className="min-w-[100px] text-green-600 border-green-600 hover:bg-green-50"
            >
              <Check className="w-4 h-4 mr-1" /> Following
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      {message}
    </div>
  );
}

export default ActivityPage;