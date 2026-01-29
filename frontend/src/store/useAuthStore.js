import { create } from 'zustand';
import axiosClient from '../axiosConfig/axiosConfig.js';

const useAuthStore = create((set) => ({
    user: null,
    accessToken: null,
    isLoading: false,

    setAccessToken: (token) => set({ accessToken: token }),

    handleLogin: async (username, password) => {
        set({ isLoading: true });
        try {
            const res = await axiosClient.post('/auth/login', { username, password });

            // Lưu ý: API của bạn trả về { accessToken, tokenType, ... }
            set({
                user: res.data.user,
                accessToken: res.data.accessToken,
                isLoading: false
            });
        } catch (err) {
            set({ isLoading: false });
            throw err; // Để component xử lý hiển thị lỗi
        }
    },
    handleRegister: async (registerData) => {
        set({ isLoading: true });
        try {
            const res = await axiosClient.post('/auth/register', registerData);
            set({ isLoading: false });
            return res.data;
        } catch (err) {
            set({ isLoading: false });
            throw err;
        }
    },

    logout: () => {
        set({ user: null, accessToken: null });
        // Có thể điều hướng người dùng về trang login ở đây
    }
}));

export default useAuthStore;