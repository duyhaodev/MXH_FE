import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/userSlice";
import postsReducer from "../store/postsSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    // ...other reducers
  },
});

export default store;