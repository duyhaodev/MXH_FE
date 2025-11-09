import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { searchApi } from "../../api/searchApi";

const PREVIEW_COUNT = 4; // số lượng hiển thị mặc định

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get("keyword") || "";

  const [keyword, setKeyword] = useState(initialKeyword);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ users: [], posts: [], keyword: "" });
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (initialKeyword) handleSearch(initialKeyword);
  }, [initialKeyword]);

  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setShowAllUsers(false);
    setShowAllPosts(false);

    try {
      const res = await searchApi.search(keyword);
      let data;
      if (res && res.data) {
        data = res.data.result || {};
      } else {
        data = res?.result || {};
      }
      console.log("Search response:", res);

      setResult({
        users: Array.isArray(data.users) ? data.users : [],
        posts: Array.isArray(data.posts) ? data.posts : [],
        keyword: keyword,
      });
    } catch (e) {
      console.error("Search error:", e);
      setResult({ users: [], posts: [], keyword });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = (type) => {
    navigate(`/search/all-results?type=${type}&keyword=${keyword}`);
  };

  const handleClickItem = (item, type) => {
    setSelectedItem({ ...item, type });
  };

  const renderUsers = () => {
    const usersToShow = result.users.slice(0, PREVIEW_COUNT);
    return (
      <>
        {usersToShow.map(u => (
          <div key={u.id} onClick={() => handleClickItem(u, "user")}
            className="flex items-center gap-3 p-3 rounded-xl border border-cyan-400/40 bg-black/60 hover:bg-cyan-900/20 cursor-pointer transition-all">
            <img src={u.avatarUrl || "https://placehold.co/50x50?text=U"} alt={u.userName}
              className="w-12 h-12 aspect-square rounded-full border-2 border-cyan-400/70 object-cover" />
            <div>
              <p className="font-semibold text-cyan-100">{u.userName}</p>
              <p className="text-sm text-cyan-300/70">{u.full_name}</p>
            </div>
          </div>
        ))}
        {result.users.length > PREVIEW_COUNT && (
          <button onClick={() => handleViewAll("users")}
            className="mt-2 text-cyan-300 hover:text-cyan-100 underline">
            Xem tất cả ({result.users.length})
          </button>
        )}
      </>
    );
  };

  const renderPosts = () => {
    const postsToShow = result.posts.slice(0, PREVIEW_COUNT);
    return (
      <>
        {postsToShow.map(p => (
          <div key={p.id} onClick={() => handleClickItem(p, "post")}
            className="p-4 rounded-xl border border-pink-400/40 bg-black/60 hover:bg-pink-900/20 cursor-pointer transition-all">
            <p className="text-pink-300 font-medium mb-1">{p.authorname || "Ẩn danh"}</p>
            <p className="text-gray-100">{p.content}</p>
          </div>
        ))}
        {result.posts.length > PREVIEW_COUNT && (
          <button onClick={() => handleViewAll("posts")}
            className="mt-2 text-pink-300 hover:text-pink-100 underline">
            Xem tất cả ({result.posts.length})
          </button>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-3xl bg-black/70 border border-cyan-500/30 rounded-2xl shadow-[0_0_25px_rgba(0,255,255,0.3)] backdrop-blur-lg p-6 transition-all hover:shadow-[0_0_45px_rgba(0,255,255,0.6)]">
        <h1 className="text-center text-2xl font-semibold mb-10 text-white tracking-widest drop-shadow-[0_0_25px_#00ffff] mt-16">
          TÌM KIẾM
        </h1>

        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="🔎 Tìm người dùng hoặc bài viết..."
            className="flex-1 bg-black border-2 border-cyan-400/50 text-cyan-100 placeholder-gray-500 rounded-xl px-5 py-3 focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_15px_rgba(0,255,255,0.6)] transition-all"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-5 py-3 font-semibold rounded-xl text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.7)] hover:shadow-[0_0_25px_rgba(0,255,255,0.9)] transition-all active:scale-95"
          >
            Tìm
          </button>
        </div>

        {loading && <p className="text-center text-cyan-300 animate-pulse">Đang tìm kiếm...</p>}

        {!loading && result && (
          <div className="space-y-8">
            {result.users.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-cyan-300 border-b border-cyan-500/40 pb-1 mb-3">
                  👤 Mọi Người
                </h3>
                <div className="space-y-3">{renderUsers()}</div>
              </div>
            )}

            {result.posts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-pink-400 border-b border-pink-500/40 pb-1 mb-3">
                  📝 Bài Viết
                </h3>
                <div className="space-y-3">{renderPosts()}</div>
              </div>
            )}

            {result.users.length === 0 && result.posts.length === 0 && (
              <p className="text-center text-gray-400 italic">
                Không tìm thấy kết quả cho <span className="text-cyan-300">"{result.keyword}"</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default SearchPage;