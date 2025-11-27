import axiosClient from "./axiosClient";

const authApi = {
    login (data) {
        const url = "auth/token"
        return axiosClient.post(url,data)
    },

    introspect(token){
      const url = "auth/introspect"
      return axiosClient.post(url, {token})
    },
    register (data) {
        const url = "users";
        return axiosClient.post(url, data)
    }
}

export default authApi