import axios from "axios"

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

//Interceptors
// Add a request interceptor
axiosClient.interceptors.request.use( 
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor
<<<<<<< Updated upstream
axiosClient.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response?.status === 401)
      // Ví dụ: redirect về trang login
      window.location.href = "/login";
    return Promise.reject(error);
  });
=======
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;  //Lấy mã lỗi 400, 401, 403, 500...
    const url = error.config?.url || "";  // Lấy URL của API bị lỗi (nếu có)

    const isAuthEndpoint =
      url.includes("/auth/token") ||
      url.includes("/users") ||          
      url.includes("/auth/refresh");

    if (status === 401 && !isAuthEndpoint) {
      // token invalid or expired -> clear and redirect to login
      localStorage.removeItem("token");
      // Force reload to ensure app state (redux) resets; navigate to login
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message || "Lỗi server, vui lòng thử lại sau!";
    return Promise.reject(new Error(message));  // Ném lỗi ra ngoài dưới dạng `Error(message)`
  }
);

>>>>>>> Stashed changes

export default axiosClient;