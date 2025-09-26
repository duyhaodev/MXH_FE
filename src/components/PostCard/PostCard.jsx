import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Verified } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function PostCard({ post, onProfileClick }) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isReposted, setIsReposted] = useState(post.isReposted);
  const [likes, setLikes] = useState(post.likes);
  const [reposts, setReposts] = useState(post.reposts);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleRepost = () => {
    setIsReposted(!isReposted);
    setReposts(isReposted ? reposts - 1 : reposts + 1);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="border-b border-border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex gap-3">
        <div
          variant="ghost"
          size="sm"
          className="p-0 h-auto rounded-full"
          onClick={() => onProfileClick?.(post.author.username)}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
            <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:underline"
              onClick={() => onProfileClick?.(post.author.username)}
            >
              <span className="font-medium">{post.author.displayName}</span>
            </Button>
            {post.author.verified && (
              <Verified className="w-4 h-4 text-blue-500 fill-blue-500" />
            )}
            <span className="text-muted-foreground">@{post.author.username}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{post.timestamp}</span>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" className="p-2 h-auto">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mb-3">
            <p className="whitespace-pre-wrap">{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={post.images[0]}
                  alt="Post image"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between max-w-md">
            <Button variant="ghost" size="sm" className="p-2 h-auto group">
              <MessageCircle className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
              <span className="ml-1 text-sm text-muted-foreground group-hover:text-blue-500">
                {formatNumber(post.replies)}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto group"
              onClick={handleRepost}
            >
              <Repeat2
                className={`w-5 h-5 transition-colors ${
                  isReposted ? "text-green-500" : "group-hover:text-green-500"
                }`}
              />
              <span
                className={`ml-1 text-sm transition-colors ${
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
              onClick={handleLike}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? "text-red-500 fill-red-500" : "group-hover:text-red-500"
                }`}
              />
              <span
                className={`ml-1 text-sm transition-colors ${
                  isLiked
                    ? "text-red-500"
                    : "text-muted-foreground group-hover:text-red-500"
                }`}
              >
                {formatNumber(likes)}
              </span>
            </Button>

            <Button variant="ghost" size="sm" className="p-2 h-auto group">
              <Share className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}