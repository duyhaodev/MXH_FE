import axios from "axios"

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    },
    // withCredentials: true
});

//Interceptors
// Add a request interceptor
axiosClient.interceptors.request.use( 
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

// Add a response interceptor
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
      // window.location.href = "/login";  // Tạm thời bỏ redirect hoặc tự xử lý logout ở nơi khác
    }

    const message =
      error.response?.data?.message || "Lỗi server, vui lòng thử lại sau!";
    return Promise.reject(new Error(message));  // Ném lỗi ra ngoài dưới dạng `Error(message)`
  }
);


export default axiosClient;