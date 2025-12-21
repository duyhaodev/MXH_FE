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
    },

    logout (token) {
        const url = "auth/logout";
        return axiosClient.post(url, {token})
    },

    verify (email, code) {
        const url = `users/verify?email=${email}&code=${code}`;
        return axiosClient.post(url);
    },

    resendOtp(email) {
        const url = `users/resend-otp?email=${email}`;
        return axiosClient.post(url);
    }
}

export default authApi