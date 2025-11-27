import { useState, useMemo } from "react";
import { Heart, MessageCircle, Repeat2, UserPlus, AtSign, Verified } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { mockActivities } from "../../data/mockData.js";

export function ActivityPage({ onProfileClick }) {
  const [activities, setActivities] = useState(mockActivities);

  // Lọc activities theo loại
  const allActivities = activities;
  const replyActivities = useMemo(
    () => activities.filter((a) => a.type === "reply"),
    [activities]
  );
  const mentionActivities = useMemo(
    () => activities.filter((a) => a.type === "mention"),
    [activities]
  );
  const verifiedActivities = useMemo(
    () => activities.filter((a) => a.user.verified),
    [activities]
  );

  const handleFollowBack = (activityId) => {
    console.log("Follow back:", activityId);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-border p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl">Activity</h2>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
          >
            Replies
          </TabsTrigger>
          <TabsTrigger
            value="mentions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
          >
            Mentions
          </TabsTrigger>
          <TabsTrigger
            value="verified"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
          >
            Verified
          </TabsTrigger>
        </TabsList>

        {/* Tab All */}
        <TabsContent value="all" className="mt-0">
          {allActivities.length > 0 ? (
            allActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onProfileClick={onProfileClick}
                onFollowBack={handleFollowBack}
              />
            ))
          ) : (
            <EmptyState message="No activities yet" />
          )}
        </TabsContent>

        {/* Tab Replies */}
        <TabsContent value="replies" className="mt-0">
          {replyActivities.length > 0 ? (
            replyActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onProfileClick={onProfileClick}
                onFollowBack={handleFollowBack}
              />
            ))
          ) : (
            <EmptyState message="No replies yet" />
          )}
        </TabsContent>

        {/* Tab Mentions */}
        <TabsContent value="mentions" className="mt-0">
          {mentionActivities.length > 0 ? (
            mentionActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onProfileClick={onProfileClick}
                onFollowBack={handleFollowBack}
              />
            ))
          ) : (
            <EmptyState message="No mentions yet" />
          )}
        </TabsContent>

        {/* Tab Verified */}
        <TabsContent value="verified" className="mt-0">
          {verifiedActivities.length > 0 ? (
            verifiedActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onProfileClick={onProfileClick}
                onFollowBack={handleFollowBack}
              />
            ))
          ) : (
            <EmptyState message="No activities from verified users yet" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component hiển thị từng activity item
function ActivityItem({ activity, onProfileClick, onFollowBack }) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "like":
        return <Heart className="w-8 h-8 text-red-500 fill-red-500" />;
      case "reply":
        return <MessageCircle className="w-8 h-8 text-blue-500" />;
      case "repost":
        return <Repeat2 className="w-8 h-8 text-green-500" />;
      case "follow":
        return <UserPlus className="w-8 h-8 text-purple-500" />;
      case "mention":
        return <AtSign className="w-8 h-8 text-blue-500" />;
      default:
        return null;
    }
  };

  const getActivityText = () => {
    switch (activity.type) {
      case "like":
        return "liked your thread";
      case "reply":
        return "replied to your thread";
      case "repost":
        return "reposted your thread";
      case "follow":
        return "followed you";
      case "mention":
        return "mentioned you";
      default:
        return "";
    }
  };

  return (
    <div
      className={`border-b border-border p-4 hover:bg-muted/50 transition-colors ${
        !activity.read ? "bg-muted/30" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">{getActivityIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* User info và action */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto rounded-full flex-shrink-0"
                onClick={() => onProfileClick?.(activity.user.username)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={activity.user.avatar}
                    alt={activity.user.displayName}
                  />
                  <AvatarFallback>
                    {activity.user.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>

              <div className="flex items-center gap-1 min-w-0 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto hover:underline"
                  onClick={() => onProfileClick?.(activity.user.username)}
                >
                  <span className="font-medium truncate">
                    {activity.user.displayName}
                  </span>
                </Button>
                {activity.user.verified && (
                  <Verified className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />
                )}
                <span className="text-muted-foreground text-sm">
                  {getActivityText()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-muted-foreground text-sm">
                {activity.timestamp}
              </span>
              {activity.type === "follow" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFollowBack(activity.id)}
                >
                  Follow
                </Button>
              )}
            </div>
          </div>

          {/* Post preview cho like, reply, repost, mention */}
          {(activity.type === "like" ||
            activity.type === "reply" ||
            activity.type === "repost" ||
            activity.type === "mention") &&
            activity.post && (
              <div className="mt-2">
                {activity.type === "reply" && activity.replyContent && (
                  <div className="mb-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{activity.replyContent}</p>
                  </div>
                )}
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.post.content}
                  </p>
                  {activity.post.images && activity.post.images.length > 0 && (
                    <div className="mt-2 rounded overflow-hidden">
                      <img
                        src={activity.post.images[0]}
                        alt="Post preview"
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Component empty state
function EmptyState({ message }) {
  return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default ActivityPage;