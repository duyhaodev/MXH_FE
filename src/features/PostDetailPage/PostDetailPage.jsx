import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import postApi from "@/api/postApi";
import { PostCard } from "@/components/PostCard/PostCard.jsx";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function PostDetailPage() {
  const { postId } = useParams(); // Lấy postId từ URL
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy chi tiết 1 bài viết
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await postApi.getPostById(postId);
        setPost(data);
      } catch (err) {
        console.error("Lỗi khi load post detail:", err);
        toast.error("Không tải được bài viết");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleProfileClick = (username) => {
    if (!username) return;
    navigate(`/profile/@${username}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto border-x min-h-screen">
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold">Thread</span>
        </div>
        <div className="p-4 text-sm text-muted-foreground">
          Không tìm thấy bài viết.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto border-x min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-semibold">Thread</span>
      </div>

      {/* Bài viết chi tiết */}
      <PostCard
        post={post}
        onProfileClick={handleProfileClick}
      />
    </div>
  );
}

export default PostDetailPage;
