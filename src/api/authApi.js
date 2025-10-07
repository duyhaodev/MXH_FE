import axiosClient from "./axiosClient";

const authApi = {
    login (data) {
        const url = "auth/token"
        return axiosClient.post(url,data)
    }
}

export default authApi