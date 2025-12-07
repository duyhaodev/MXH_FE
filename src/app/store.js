import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/userSlice";
import postsReducer from "../store/postsSlice";
import composerReducer from "../store/composerSlice";
import commentsReducer from "../store/commentsSlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    composer: composerReducer,
    comments: commentsReducer,
  },
});

export default store;