import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '../axiosConfig/axiosConfig.js';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isLoading: false,

            setAccessToken: (token) => set({ accessToken: token }),

            setUser: (user) => set({ user }),

            handleLogin: async (username, password) => {
                set({ isLoading: true });
                try {
                    console.log('Login request:', { username, password });
                    
                    const res = await axiosClient.post('/auth/login', 
                        { username, password }
                    );
                    
                    console.log('Login response:', res);
                    console.log('Response data:', res.data);

                    // Backend trả về: { tokenType, accessToken, user }
                    set({
                        user: res.data.user, // { id, username, email, fullName, phoneNumber, role }
                        accessToken: res.data.accessToken,
                        isLoading: false
                    });

                    return res.data.user; // Trả về user để component biết role
                } catch (err) {
                    console.error('Login error:', err);
                    console.error('Error response:', err.response?.data);
                    console.error('Error status:', err.response?.status);
                    set({ isLoading: false });
                    throw err;
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
                // Chỉ cần xóa state local
                set({ user: null, accessToken: null });
            }
        }),
        {
            name: 'auth-storage', // Tên key trong localStorage
            partialize: (state) => ({ 
                user: state.user,
                accessToken: state.accessToken 
            }),
        }
    )
);

export default useAuthStore;
