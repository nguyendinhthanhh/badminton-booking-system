import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialMode = location.state?.mode || "login";
    const [authMode, setAuthMode] = useState(initialMode);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        confirmPassword: ""
    });

    const { handleLogin, handleRegister, isLoading } = useAuthStore();
    const heroImage = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200';

    // Update authMode when location state changes
    useEffect(() => {
        if (location.state?.mode) {
            setAuthMode(location.state.mode);
        }
    }, [location.state]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            if (authMode === "login") {
                const user = await handleLogin(formData.username, formData.password);

                // Navigate immediately based on role
                // Navigate based on role or return to previous page
                if (user.roleName === 'ADMIN') {
                    navigate('/admin');
                } else {
                    const from = location.state?.from || '/';
                    navigate(from);
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError("Mật khẩu xác nhận không khớp!");
                    return;
                }
                await handleRegister(formData);
                setSuccess("Đăng ký thành công! Đang chuyển sang đăng nhập...");
                setTimeout(() => {
                    setAuthMode("login");
                    setSuccess("");
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            {/* Left Panel: Hero Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent mix-blend-multiply opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>

                <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
                    <div className="max-w-lg">
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Đặt sân cầu lông dễ dàng, mọi lúc mọi nơi.
                        </h2>
                        <p className="text-lg opacity-90 font-light">
                            Kết nối đam mê, nâng tầm kỹ năng cùng cộng đồng cầu lông lớn nhất Việt Nam.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-white dark:bg-background-dark relative">
                <div className="w-full max-w-[480px] flex flex-col gap-6">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-[#616e89] dark:text-gray-400 hover:text-primary transition-colors mb-4 group"
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="text-sm font-medium">Quay lại trang chủ</span>
                    </button>

                    {/* Header */}
                    <div className="text-left mb-2">
                        <h1 className="text-[#111318] dark:text-white text-[32px] font-bold leading-tight pb-2">
                            {authMode === "login" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
                        </h1>
                        <p className="text-[#616e89] dark:text-gray-400 text-base">
                            {authMode === "login" ? "Chào mừng bạn trở lại!" : "Tạo tài khoản mới"}
                        </p>
                    </div>

                    {/* Auth Form */}
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        {authMode === "login" ? (
                            <>
                                {/* Email/Phone Field */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">
                                        Tên đăng nhập
                                    </span>
                                    <input
                                        className="w-full rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#616e89] dark:placeholder:text-gray-500"
                                        placeholder="Tên đăng nhập"
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange("username", e.target.value)}
                                        required
                                    />
                                </label>

                                {/* Password Field */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Mật khẩu</span>
                                    <div className="relative flex w-full">
                                        <input
                                            className="w-full rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 pl-4 pr-12 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#616e89] dark:placeholder:text-gray-500"
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleInputChange("password", e.target.value)}
                                            required
                                        />
                                        <button
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#616e89] dark:text-gray-400 hover:text-primary transition-colors"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                {showPassword ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                </label>

                                {/* Remember & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                className="appearance-none h-5 w-5 rounded border-2 border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 checked:bg-primary checked:border-primary cursor-pointer transition-all"
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                            {rememberMe && (
                                                <span className="material-symbols-outlined absolute text-white pointer-events-none text-[16px] left-[2px] top-[2px]">
                                                    check
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-normal text-[#616e89] dark:text-gray-400 group-hover:text-primary transition-colors">
                                            Ghi nhớ đăng nhập
                                        </span>
                                    </label>
                                    <a className="text-sm font-medium text-primary hover:text-blue-700 transition-colors" href="#">
                                        Quên mật khẩu?
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Register Fields */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Họ và tên</span>
                                    <input
                                        className="w-full rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#616e89] dark:placeholder:text-gray-500"
                                        placeholder="Nguyễn Văn A"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Email</span>
                                    <input
                                        className="w-full rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#616e89] dark:placeholder:text-gray-500"
                                        placeholder="example@email.com"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Tên đăng nhập</span>
                                    <input
                                        className="w-full rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#616e89] dark:placeholder:text-gray-500"
                                        placeholder="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange("username", e.target.value)}
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Số điện thoại</span>
                                    <input
                                        className="w-full rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#616e89] dark:placeholder:text-gray-500"
                                        placeholder="0123456789"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Mật khẩu</span>
                                    <input
                                        className="w-full rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#616e89] dark:placeholder:text-gray-500"
                                        placeholder="••••••••"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        required
                                    />
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-[#111318] dark:text-gray-200 text-sm font-medium">Xác nhận mật khẩu</span>
                                    <input
                                        className="w-full rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-[#616e89] dark:placeholder:text-gray-500"
                                        placeholder="••••••••"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        required
                                    />
                                </label>
                            </>
                        )}

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-green-500 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                {success}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/30 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Đang xử lý..." : (authMode === "login" ? "Đăng nhập" : "Đăng ký")}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-[#dbdee6] dark:border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-sm text-[#616e89] dark:text-gray-500">
                            Hoặc {authMode === "login" ? "đăng nhập" : "đăng ký"} bằng
                        </span>
                        <div className="flex-grow border-t border-[#dbdee6] dark:border-gray-700"></div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 h-12 rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white relative overflow-hidden">
                                <svg className="w-full h-full block" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335" />
                                    <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4" />
                                    <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05" />
                                    <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853" />
                                </svg>
                            </div>
                            <span className="text-[#111318] dark:text-white font-medium text-sm">Google</span>
                        </button>

                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 h-12 rounded-lg border border-[#dbdee6] dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#1877F2] text-white">
                                <span className="font-bold text-sm">f</span>
                            </div>
                            <span className="text-[#111318] dark:text-white font-medium text-sm">Facebook</span>
                        </button>
                    </div>

                    {/* Footer Link */}
                    <div className="mt-4 text-center">
                        <p className="text-[#616e89] dark:text-gray-400 text-sm">
                            {authMode === "login" ? "Bạn chưa có tài khoản?" : "Đã có tài khoản?"}
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthMode(authMode === "login" ? "register" : "login");
                                    setError("");
                                    setSuccess("");
                                }}
                                className="text-primary font-bold hover:underline ml-1"
                            >
                                {authMode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
