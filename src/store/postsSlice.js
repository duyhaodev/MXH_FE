import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import postApi from "../api/postApi";

// Load feed
export const fetchFeed = createAsyncThunk(
  "posts/fetchFeed",
  async ({ page = 0, size = 20 }, { rejectWithValue }) => {
    try {
      const res = await postApi.getFeed({ page, size }); // res: PostResponse[] (axiosClient trả response.data)
      const data = Array.isArray(res) ? res : [];
      return { page, size, data };
    } catch (err) {
      return rejectWithValue(err?.message || "Load feed thất bại");
    }
  }
);

// Tạo bài viết
export const createPost = createAsyncThunk(
  "posts/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await postApi.create(formData);
      // axiosClient đã trả về response.data => res chính là PostResponse
      return res; // (KHÔNG .data nữa)
    } catch (err) {
      // interceptor đã ném new Error(message) => lấy err.message
      return rejectWithValue({ message: err?.message || "Create post failed" });
    }
  }
);

// Lấy bài viết của user đăng nhập
export const fetchMyPosts = createAsyncThunk(
  "posts/fetchMyPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await postApi.getMyPosts();
      return res; // res = List<PostResponse>
    } catch (err) {
      return rejectWithValue(err?.message || "Load my posts failed");
    }
  }
);

// Lấy bài viết theo username (profile người khác)
export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async ({ username }, { rejectWithValue }) => {
    try {
      const res = await postApi.getUserPosts(username);
      const data = Array.isArray(res) ? res : [];
      return { username, data };
    } catch (err) {
      return rejectWithValue(err?.message || "Load user posts failed");
    }
  }
);

// Lấy chi tiết bài viết theo ID
export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await postApi.getPostById(postId);
      return res; // PostResponse
    } catch (err) {
      return rejectWithValue(err?.message || "Load post detail failed");
    }
  }
);



const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    page: 0,
    size: 20,
    hasMore: true,
    loading: false,
    creating: false,
    error: null,

    myPosts: [],
    loadingMyPosts: false,
    myPostsError: null,

    userPosts: [],
    loadingUserPosts: false,
    userPostsError: null,

    postDetail: null,
    loadingPostDetail: false,
    postDetailError: null,
  },
  reducers: {
    resetFeed(state) {
      state.items = [];
      state.page = 0;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFeed
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        const { page, data } = action.payload;
        const sorted = data.slice().sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        if (page === 0) {
          state.items = sorted;
        } else {
          state.items = [...state.items, ...sorted];
        }
        state.page = page + 1;
        state.loading = false;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Load feed thất bại";
      })

      // createPost
      .addCase(createPost.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]; // bài mới lên đầu
        state.creating = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.message || "Đăng bài thất bại";
      })

      // fetchMyPosts
      .addCase(fetchMyPosts.pending, (state) => {
        state.loadingMyPosts = true;
        state.myPostsError = null;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.loadingMyPosts = false;
        state.myPosts = action.payload || [];
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.loadingMyPosts = false;
        state.myPostsError = action.payload || "Load my posts failed";
      })

      // fetchUserPosts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loadingUserPosts = true;
        state.userPostsError = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loadingUserPosts = false;
        const { data } = action.payload;
        // có thể sort theo createdAt nếu muốn giống feed
        const sorted = data.slice().sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        state.userPosts = sorted;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loadingUserPosts = false;
        state.userPostsError = action.payload || "Load user posts failed";
      })

      // fetchPostById
      .addCase(fetchPostById.pending, (state) => {
        state.loadingPostDetail = true;
        state.postDetailError = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loadingPostDetail = false;
        state.postDetail = action.payload || null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loadingPostDetail = false;
        state.postDetail = null;
        // vì rejectWithValue(err.message) => payload là string
        state.postDetailError = action.payload || "Load post detail failed";
      });
  },
});

export const { resetFeed } = postsSlice.actions;
export default postsSlice.reducer;

// Selectors
export const selectPosts = (state) => state.posts.items;
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsCreating = (state) => state.posts.creating;
export const selectPostsHasMore = (state) => state.posts.hasMore;
export const selectPostsPage = (state) => state.posts.page;
export const selectPostsError = (state) => state.posts.error;
export const selectMyPosts = (state) => state.posts.myPosts;
export const selectMyPostsLoading = (state) => state.posts.loadingMyPosts;
export const selectMyPostsError = (state) => state.posts.myPostsError;
export const selectUserPosts = (state) => state.posts.userPosts;
export const selectUserPostsLoading = (state) => state.posts.loadingUserPosts;
export const selectUserPostsError = (state) => state.posts.userPostsError;
export const selectPostDetail = (state) => state.posts.postDetail;
export const selectPostDetailLoading = (state) => state.posts.loadingPostDetail;
export const selectPostDetailError = (state) => state.posts.postDetailError;



