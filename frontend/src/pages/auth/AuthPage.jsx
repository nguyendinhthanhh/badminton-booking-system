import { useState } from "react";
import { Header } from "./Header";
import { LoginInput } from "../../components/auth/LoginInput";
import { RegisterForm } from "../../components/auth/RegisterForm"; // Import mới
import useAuthStore from "../../store/useAuthStore";

const AuthPage = () => {
    const [authMode, setAuthMode] = useState("login");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        phoneNumber: ""
    });

    // Lấy hàm từ Zustand Store
    const { handleLogin, handleRegister, isLoading } = useAuthStore();

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            if (authMode === "login") {
                await handleLogin(formData.username, formData.password);
                setSuccess("Login successful!");
            } else {
                await handleRegister(formData);
                setSuccess("Registration successful! Switching to login...");
                setTimeout(() => {
                    setAuthMode("login");
                    setSuccess("");
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <Header />
            <main className="grow flex flex-col relative overflow-hidden">
                {/* Background Overlay giữ nguyên như cũ */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img alt="bg" className="object-cover w-full h-full opacity-10 blur-[2px]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJWQ3QnTKQAKeEhYKT-NyY5DyV4Q5cduk-sAF3EVWM65nrbey-n98_4EfadADNyxreBy_xtzaY2jWYVjeEHRDocQv0KnygdyQP47QrVX4t8whHdWxkqU8EDHdPj6lMlrn8da8v-1sq4_a0mSmbkZLp4d8HVX1VFJexi1o0WIbdF1wXjWwpf7uOeYWAxHswPtZTSUzThwTDKdwKKBtm9E1EVVmG_LXNneHnRkxBc8G-Q1amuRQWe4XYEc-o5XdfONChDVopsm20tiA"/>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-light dark:to-background-dark"></div>
                </div>

                <div className="relative z-10 px-4 flex flex-1 items-center justify-center py-10">
                    <div className="flex flex-col w-full max-w-[480px] bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden">

                        <div className="p-8 pb-4 text-center">
                            <h1 className="text-3xl font-bold">{authMode === "login" ? "Welcome Back" : "Create Account"}</h1>
                        </div>

                        {/* Tab Selection */}
                        <div className="px-8 pb-6">
                            <div className="flex border-b border-slate-200 dark:border-border-dark">
                                {["login", "register"].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => { setAuthMode(mode); setError(""); }}
                                        className={`flex-1 pb-3 pt-4 font-bold text-sm uppercase tracking-wider transition-all border-b-[3px] ${authMode === mode ? "border-primary text-primary" : "border-transparent text-slate-400"}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-8 pb-8">
                            {authMode === "login" ? (
                                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <LoginInput
                                        label="Username" icon="person" placeholder="Username"
                                        value={formData.username} onChange={(e) => handleInputChange("username", e.target.value)}
                                    />
                                    <LoginInput
                                        label="Password" icon="lock" type="password" placeholder="Password" isPassword
                                        value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)}
                                    />
                                </div>
                            ) : (
                                <RegisterForm formData={formData} handleInputChange={handleInputChange} />
                            )}

                            {/* Error/Success Messages */}
                            {error && <div className="text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
                            {success && <div className="text-green-500 text-xs bg-green-500/10 p-3 rounded-lg border border-green-500/20">{success}</div>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                            >
                                {isLoading ? "Processing..." : (authMode === "login" ? "Sign In" : "Register")}
                            </button>

                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthPage;