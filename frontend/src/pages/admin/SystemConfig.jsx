import React, { useState, useEffect } from 'react';
import systemConfigService from '../../services/systemConfigService';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { Clock, Save, Settings } from 'lucide-react';

const SystemConfig = () => {
    const [configs, setConfigs] = useState({
        OPERATING_START: '05:00',
        OPERATING_END: '23:00'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const data = await systemConfigService.getAllConfigs();
            setConfigs(prev => ({ ...prev, ...data }));
        } catch (error) {
            toast.error('Lỗi khi tải cấu hình hệ thống');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfigs(prev => ({ ...prev, [name]: value }));
    };

    const generateTimeOptions = () => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            options.push(`${hour}:00`);
            options.push(`${hour}:30`);
        }
        return options;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await systemConfigService.updateConfigs(configs);
            toast.success('Cập nhật cấu hình thành công!');
        } catch (error) {
            toast.error('Lỗi khi cập nhật cấu hình');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                    {/* Header Skeleton */}
                    <div className="space-y-2 animate-pulse">
                        <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                        <div className="h-4 w-96 bg-gray-200 rounded-lg"></div>
                    </div>

                    {/* Card Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                            <div className="space-y-2">
                                <div className="h-5 w-40 bg-gray-200 rounded"></div>
                                <div className="h-3 w-64 bg-gray-200 rounded"></div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Input Skeleton 1 */}
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-12 w-full bg-gray-100 rounded-xl border-2 border-transparent"></div>
                                    <div className="h-3 w-48 bg-gray-200 rounded"></div>
                                </div>
                                {/* Input Skeleton 2 */}
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-12 w-full bg-gray-100 rounded-xl border-2 border-transparent"></div>
                                    <div className="h-3 w-48 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
                                <div className="h-12 w-40 bg-gray-200 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <PageHeader
                    title="Cấu hình Hệ thống"
                    subtitle="Quản lý các tham số vận hành và cài đặt chung của hệ thống."
                />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Thời gian hoạt động</h3>
                            <p className="text-sm text-gray-500">Thiết lập khung giờ mở cửa và đóng cửa của sân.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Start Time */}
                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider" htmlFor="OPERATING_START">
                                    <Clock className="w-4 h-4 text-purple-500" />
                                    Giờ mở cửa
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        list="timeOptions"
                                        id="OPERATING_START"
                                        name="OPERATING_START"
                                        value={configs.OPERATING_START}
                                        onChange={handleChange}
                                        placeholder="05:00"
                                        pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 text-gray-900 font-bold transition-all outline-none placeholder:text-gray-400 group-hover:bg-gray-100/80 group-hover:focus:bg-white"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <span className="material-symbols-outlined text-lg">schedule</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">
                                    Thời gian bắt đầu nhận đặt sân trong ngày.
                                </p>
                            </div>

                            {/* End Time */}
                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider" htmlFor="OPERATING_END">
                                    <Clock className="w-4 h-4 text-rose-500" />
                                    Giờ đóng cửa
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        list="timeOptions"
                                        id="OPERATING_END"
                                        name="OPERATING_END"
                                        value={configs.OPERATING_END}
                                        onChange={handleChange}
                                        placeholder="23:00"
                                        pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 text-gray-900 font-bold transition-all outline-none placeholder:text-gray-400 group-hover:bg-gray-100/80 group-hover:focus:bg-white"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <span className="material-symbols-outlined text-lg">schedule</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 font-medium">
                                    Thời gian kết thúc hoạt động (đóng sân).
                                </p>
                            </div>
                        </div>

                        <datalist id="timeOptions">
                            {generateTimeOptions().map(time => (
                                <option key={time} value={time} />
                            ))}
                        </datalist>

                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-200 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Lưu thay đổi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SystemConfig;
