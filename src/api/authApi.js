import axiosClient from "./axiosClient";

const authApi = {
    login (data) {
        const url = "auth/token"
        return axiosClient.post(url,data)
    },
    register(data) {
    const url = "users";   
    return axiosClient.post(url, data);
  },
}

export default authApi