import axiosClient from "./axiosClient";

const userApi = {
    register (data) {
        const url = "users";
        return axiosClient.post(url, data)
    },

    getMyInfo () {
        const url = "users/myInfo"
        return axiosClient.get(url)
    }
}

export default userApi