import axiosClient from "./axiosClient";

const userApi = {
    getMyInfo () {
        const url = "users/myInfo"
        return axiosClient.get(url)
    }
}

export default userApi