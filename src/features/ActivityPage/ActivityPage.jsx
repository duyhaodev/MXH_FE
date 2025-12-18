import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  AtSign,
  Verified,
  Check,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import notificationApi from "../../api/notificationApi";
import { resetUnreadCount } from "../../store/notificationsSlice";

export function ActivityPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onProfileClick = (username) => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // map tab -> backend type
  const typeMap = {
    all: "all",
    replies: "reply",
    mentions: "mention",
    verified: "verified",
  };

  // Helper để fetch activities (tái sử dụng cho refetch)
  const fetchActivities = useCallback(async (tabType = activeTab) => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications({
        type: typeMap[tabType],
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

  const replyActivities = useMemo(
    () => activities.filter((a) => a.type === "reply"),
    [activities]
  );

  const mentionActivities = useMemo(
    () => activities.filter((a) => a.type === "mention"),
    [activities]
  );

  const verifiedActivities = useMemo(
    () => activities.filter((a) => a.user?.verified),
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
          <TabsTrigger value="replies" className="px-6 py-3">
            Replies
          </TabsTrigger>
          <TabsTrigger value="mentions" className="px-6 py-3">
            Mentions
          </TabsTrigger>
          <TabsTrigger value="verified" className="px-6 py-3">
            Verified
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderActivities(activities, onProfileClick, handleFollowBack)}
        </TabsContent>

        <TabsContent value="replies">
          {renderActivities(replyActivities, onProfileClick, handleFollowBack)}
        </TabsContent>

        <TabsContent value="mentions">
          {renderActivities(mentionActivities, onProfileClick, handleFollowBack)}
        </TabsContent>

        <TabsContent value="verified">
          {renderActivities(verifiedActivities, onProfileClick, handleFollowBack)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================= Helpers ================= */

function renderActivities(list, onProfileClick, onFollowBack) {
  if (!list.length) {
    return <EmptyState message="No activities yet" />;
  }

  return list.map((activity) => (
    <ActivityItem
      key={activity.id}
      activity={activity}
      onProfileClick={onProfileClick}
      onFollowBack={onFollowBack}
    />
  ));
}

function ActivityItem({ activity, onProfileClick, onFollowBack }) {
  const iconMap = {
    like: <Heart className="w-8 h-8 text-red-500 fill-red-500" />,
    reply: <MessageCircle className="w-8 h-8 text-blue-500" />,
    repost: <Repeat2 className="w-8 h-8 text-green-500" />,
    follow: <UserPlus className="w-8 h-8 text-purple-500" />,
    mention: <AtSign className="w-8 h-8 text-blue-500" />,
    followed: <Check className="w-8 h-8 text-green-500" />,  // Icon mới cho trạng thái đã follow
  };

  // Kiểm tra trạng thái đã follow để ẩn button (ưu tiên từ backend)
  const isFollowed = activity.followed === true;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const dateText = formatDate(activity.timestamp);

  return (
    <div
      className={`border-b p-4 hover:bg-muted/50 transition-colors ${
        !activity.read ? "bg-muted/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {iconMap[activity.type] || iconMap[isFollowed ? 'followed' : 'follow']}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {/* Avatar + click vào profile */}
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

              <p className="text-sm text-muted-foreground line-clamp-2">
                {activity.message}
              </p>
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