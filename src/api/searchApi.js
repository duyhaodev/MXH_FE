import axiosClient from "./axiosClient";

export const searchApi = {
  search: (keyword) => axiosClient.get(`/api/search?keyword=${encodeURIComponent(keyword)}`),
};