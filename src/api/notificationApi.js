import axios from "./axiosClient";

const notificationApi = {
  // Lấy danh sách thông báo
  getNotifications: ({ type = "all", limit = 20 } = {}) => {
    return axios.get("/api/notifications", {
      params: { type, limit },
    });
  },

  // Đánh dấu thông báo là đã đọc
  markAsRead: (notificationId) => {
    return axios.patch(`/api/notifications/${notificationId}/read`);
  },

  // Follow back từ thông báo
  followBack: async (notificationId) => {
    try {
        const response = await axios.post(`/api/notifications/follow-back/${notificationId}`);
        return response.data;  // Trả về data từ response (ví dụ: {success: true, message: "..."})
    } catch (error) {
        console.error("Follow back error:", error.response?.data?.error || error.message);
        throw error;  // Re-throw để frontend xử lý (ví dụ: toast notification)
    }
    },
};

export default notificationApi;
