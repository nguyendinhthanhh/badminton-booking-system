import { useState } from "react";

export const LoginInput = ({ label, icon, type = "text", placeholder, isPassword, value, onChange }) => {
    // State để toggle ẩn/hiện mật khẩu
    const [showPassword, setShowPassword] = useState(false);

    // Xác định type của input:
    // Nếu là password và đang nhấn "hiện" thì là 'text', ngược lại giữ đúng type truyền vào
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <label className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
                {isPassword && (
                    <a className="text-xs font-medium text-primary hover:text-blue-400 transition-colors" href="#">
                        Forgot Password?
                    </a>
                )}
            </div>
            <div className="relative">
                {/* Icon bên trái */}
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-secondary text-[20px] pointer-events-none">
          {icon}
        </span>

                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    className="flex w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-[#111418] focus:ring-2 focus:ring-primary/50 focus:border-primary h-12 pl-12 pr-12 text-base transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-text-secondary text-slate-900 dark:text-white"
                    placeholder={placeholder}
                />

                {/* Nút ẩn/hiện mật khẩu bên phải */}
                {isPassword && (
                    <button
                        type="button" // Quan trọng: tránh trigger submit form
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full flex items-center pr-3 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? "visibility" : "visibility_off"}
            </span>
                    </button>
                )}
            </div>
        </label>
    );
};