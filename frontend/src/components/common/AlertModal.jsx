import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const AlertModal = ({ isOpen, type = 'info', title, message, onClose }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const config = {
        success: {
            icon: CheckCircle,
            bg: 'bg-green-100',
            text: 'text-green-600',
            button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        },
        error: {
            icon: XCircle,
            bg: 'bg-red-100',
            text: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-yellow-100',
            text: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        },
        info: {
            icon: Info,
            bg: 'bg-blue-100',
            text: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    };

    const style = config[type] || config.info;
    const Icon = style.icon;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${style.bg} sm:mx-0 sm:h-10 sm:w-10`}>
                                <Icon className={`h-6 w-6 ${style.text}`} aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button}`}
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
