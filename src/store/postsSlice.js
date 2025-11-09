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
        state.error = action.payload?.message || "Load feed thất bại";
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
