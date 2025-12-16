import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/userSlice";
import postsReducer from "../store/postsSlice";
import composerReducer from "../store/composerSlice";
import chatReducer from "../store/chatSlice";

import commentsReducer from "../store/commentsSlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    composer: composerReducer,
    chat: chatReducer,
    comments: commentsReducer,
  },
});

export default store;