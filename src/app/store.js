import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/userSlice";
import postsReducer from "../store/postsSlice";
import composerReducer from "../store/composerSlice";
import chatReducer from "../store/chatSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    composer: composerReducer,
    chat: chatReducer,
  },
});

export default store;