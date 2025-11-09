import axiosClient from "./axiosClient";

const authApi = {
    login (data) {
        const url = "auth/token"
        return axiosClient.post(url,data)
    },

    introspect(token){
      const url = "auth/introspect"
      return axiosClient.post(url, {token})
    }
}

export default authApi