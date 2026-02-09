import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRequiredModal = ({ isOpen, onClose, onLogin, message = "Bạn cần đăng nhập để thực hiện chức năng này." }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Dialog */}
                <div className="relative bg-white dark:bg-[#1a202c] rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-800 transform transition-all scale-100 opacity-100">

                    {/* Illustration/Icon */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-4xl">
                                lock
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">
                            Yêu cầu đăng nhập
                        </h3>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-8 px-4">
                        <p className="text-slate-600 dark:text-slate-300">
                            {message}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            Đăng nhập ngay để đặt sân và trải nghiệm đầy đủ tính năng!
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onLogin}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">login</span>
                            Đăng nhập ngay
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                            Để sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginRequiredModal;
