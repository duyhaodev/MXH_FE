import axiosClient from "./axiosClient";

const postApi = {
  create(formData) {
    // GỬI MULTIPART — không set Content-Type, để browser tự set boundary
    return axiosClient.post("/posts", formData, {
      transformRequest: (v) => v
    });
  },
  getFeed({ page = 0, size = 20 } = {}) {
    return axiosClient.get(`/feed?page=${page}&size=${size}`);
  },
  // lấy bài viết của mình
  getMyPosts() {
    return axiosClient.get("/profile");
  },
  // lấy bài viết của user theo username
  getUserPosts(username) {
    return axiosClient.get(`/profile/${username}`);
  },
  // lấy profile của user theo username
  getUserByUsername(username) {
    return axiosClient.get(`/users/${username}`);
  },
  // lấy chi tiết bài viết theo id
  getPostById(postId) {
  return axiosClient.get(`/posts/${postId}`);
  },
};

export default postApi;
