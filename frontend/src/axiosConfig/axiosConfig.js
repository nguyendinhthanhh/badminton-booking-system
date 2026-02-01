import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request: Đính kèm AccessToken vào header
axiosClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor cho Response: Xử lý lỗi 401 (Token hết hạn)
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn -> Đăng xuất và chuyển về trang login
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
