import axiosClient from "./axiosClient";

const postApi = {
  create(formData) {
    // GỬI MULTIPART — không set Content-Type, để browser tự set boundary
    return axiosClient.post("/posts", formData, {
      transformRequest: (v) => v
    });
  },
  getFeed({ page = 0, size = 20 } = {}) {
    return axiosClient.get(`/feed?page=${page}&size=${size}`); // nhận thẳng data
  },
};

export default postApi;
