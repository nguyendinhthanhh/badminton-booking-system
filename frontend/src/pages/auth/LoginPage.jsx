import { useState } from "react";
import { Header } from "./Header";
import { LoginInput } from "../../components/auth/LoginInput";
import useAuthStore from "../../store/useAuthStore.js"; // Đường dẫn tới file store của bạn

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Lấy các hàm và state từ Zustand
    const { handleLogin, isLoading } = useAuthStore();

    const onLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter both username and password.");
            return;
        }

        try {
            await handleLogin(username, password);
            console.log("Login successful!");
            // Redirect người dùng hoặc thông báo thành công tại đây
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <Header />

            <main className="grow flex flex-col relative overflow-hidden">
                {/* Background Layer */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                        alt="Badminton Background"
                        className="object-cover w-full h-full opacity-10 dark:opacity-20 blur-[2px]"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJWQ3QnTKQAKeEhYKT-NyY5DyV4Q5cduk-sAF3EVWM65nrbey-n98_4EfadADNyxreBy_xtzaY2jWYVjeEHRDocQv0KnygdyQP47QrVX4t8whHdWxkqU8EDHdPj6lMlrn8da8v-1sq4_a0mSmbkZLp4d8HVX1VFJexi1o0WIbdF1wXjWwpf7uOeYWAxHswPtZTSUzThwTDKdwKKBtm9E1EVVmG_LXNneHnRkxBc8G-Q1amuRQWe4XYEc-o5XdfONChDVopsm20tiA"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-light dark:to-background-dark"></div>
                </div>

                <div className="relative z-10 px-4 flex flex-1 items-center justify-center py-10">
                    <div className="flex flex-col w-full max-w-[480px] bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden">

                        <div className="flex flex-col items-center gap-3 p-8 pb-4 text-center">
                            <h1 className="text-3xl font-bold leading-tight">Welcome to BadmintonPro</h1>
                            <p className="text-slate-500 dark:text-text-secondary text-sm">Sign in to book your court or manage your reservations.</p>
                        </div>

                        <div className="px-8 pb-6">
                            <div className="flex border-b border-slate-200 dark:border-border-dark">
                                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-3 pt-4 flex-1 cursor-pointer">
                                    <p className="text-sm font-bold tracking-[0.015em]">Login</p>
                                </button>
                                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 dark:text-text-secondary pb-3 pt-4 flex-1 cursor-pointer hover:text-white transition-colors">
                                    <p className="text-sm font-bold tracking-[0.015em]">Register</p>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={onLogin} className="flex flex-col gap-5 px-8 pb-8">
                            <div className="flex flex-col gap-4">
                                <LoginInput
                                    label="Username"
                                    icon="person"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <LoginInput
                                    label="Password"
                                    icon="lock"
                                    type="password"
                                    placeholder="Enter your password"
                                    isPassword
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className="text-red-500 text-xs flex items-center gap-1 bg-red-500/10 p-2 rounded border border-red-500/20">
                                    <span className="material-symbols-outlined text-[16px]">error</span>
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex w-full items-center justify-center rounded-lg h-12 px-4 bg-primary text-white font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>

                        </form>
                    </div>
                </div>

                <footer className="text-center py-4 text-xs text-slate-400 dark:text-gray-600">
                    © 2024 BadmintonPro. All rights reserved.
                </footer>
            </main>
        </div>
    );
};

export default LoginPage;