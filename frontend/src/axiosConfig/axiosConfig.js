import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true, // Quan trọng: Cho phép gửi và nhận Cookie (RefreshToken)
});

// 1. Interceptor cho Request: Đính kèm AccessToken vào header
axiosClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Interceptor cho Response: Xử lý lỗi 401 (Hết hạn token)
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa từng thử refresh lần nào
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Gọi API refresh token
                // Lưu ý: Cookie refreshtoken sẽ tự động được trình duyệt gửi kèm nhờ withCredentials
                const res = await axios.post('http://localhost:8080/api/auth/refresh-token', {}, { withCredentials: true });

                const newAccessToken = res.data.accessToken;

                // Cập nhật token mới vào Zustand
                useAuthStore.getState().setAccessToken(newAccessToken);

                // Thực hiện lại request cũ với token mới
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // Nếu refresh cũng lỗi (hết hạn cả refresh token) -> Đăng xuất
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;