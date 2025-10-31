import axiosClient from "./axiosClient";

const postApi = {
  create(data) {
    return axiosClient.post("/posts", data); // nhận thẳng data từ BE
  },
  getFeed({ page = 0, size = 20 } = {}) {
    return axiosClient.get(`/posts/feed?page=${page}&size=${size}`); // nhận thẳng data
  },
};

export default postApi;
