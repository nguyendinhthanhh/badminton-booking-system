import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, User, Phone, MapPin, Save, UserPlus, UserCheck, ShieldAlert, Search, Loader2 } from 'lucide-react';
import adminBookingService from '../../services/adminBookingService';

const WalkInBookingModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [customerType, setCustomerType] = useState('GUEST'); // 'GUEST' or 'USER'

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const defaultStartTime = `${currentHour}:${currentMinute}`;

    // End time default to 1 hour later, but capped at 23:00
    let nextHourNum = now.getHours() + 1;
    let nextMinuteStr = currentMinute;

    // If next hour goes beyond 23:00, cap it at 23:00
    if (nextHourNum >= 23) {
        nextHourNum = 23;
        nextMinuteStr = '00';
    }

    const nextHour = String(nextHourNum).padStart(2, '0');
    const defaultEndTime = `${nextHour}:${nextMinuteStr}`;

    const [formData, setFormData] = useState({
        courtId: '',
        playDate: today,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        userId: '',
        guestName: '',
        guestPhone: '',
        notes: '',
        initialStatus: 'PLAYING',
        openEnded: false,
        estimatedDurationMinutes: '',
        maxDurationMinutes: ''
    });

    const [errors, setErrors] = useState({});
    const [courts, setCourts] = useState([]);
    const [loadingCourts, setLoadingCourts] = useState(false);
    const [courtSearch, setCourtSearch] = useState('');
    const [showCourtDropdown, setShowCourtDropdown] = useState(false);
    const courtDropdownRef = useRef(null);

    // User Search State
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchCourts();
            // Reset form when opening
            setFormData({
                courtId: '',
                playDate: today,
                startTime: defaultStartTime,
                endTime: defaultEndTime,
                userId: '',
                guestName: '',
                guestPhone: '',
                notes: '',
                initialStatus: 'PLAYING',
                openEnded: false,
                estimatedDurationMinutes: '',
                maxDurationMinutes: ''
            });
            setCustomerType('GUEST');
            setErrors({});
            setUserSearch('');
            setCourtSearch('');
        }
    }, [isOpen]);

    // Fetch courts on mount/open
    const fetchCourts = async () => {
        setLoadingCourts(true);
        try {
            const data = await adminBookingService.getAllCourts(0, 20);
            setCourts(data.content || []);
            if (data.content && data.content.length > 0) {
                // Do not auto-select first court
                // setFormData(prev => ({ ...prev, courtId: data.content[0].id }));
                // setCourtSearch(data.content[0].name);
            }
        } catch (error) {
            console.error('Error fetching courts:', error);
            setErrors(prev => ({ ...prev, courtId: 'Không thể tải danh sách sân' }));
        } finally {
            setLoadingCourts(false);
        }
    };

    // Click outside listener for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Click outside listener for court dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (courtDropdownRef.current && !courtDropdownRef.current.contains(event.target)) {
                setShowCourtDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced user search
    useEffect(() => {
        if (customerType === 'USER' && isOpen) {
            const timer = setTimeout(() => {
                fetchUsers(userSearch);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [userSearch, customerType, isOpen]);

    const fetchUsers = async (keyword) => {
        setLoadingUsers(true);
        try {
            const data = await adminBookingService.getUsers(0, 20, keyword);
            setUsers(data.content || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const selectUser = (user) => {
        setFormData(prev => ({ ...prev, userId: user.id }));
        setUserSearch(`${user.fullName} (${user.username})`);
        setShowUserDropdown(false);
        setErrors(prev => ({ ...prev, userId: null }));
    };

    const selectCourt = (court) => {
        setFormData(prev => ({ ...prev, courtId: court.id }));
        setCourtSearch(court.name);
        setShowCourtDropdown(false);
        setErrors(prev => ({ ...prev, courtId: null }));
    };

    // Filter courts based on search
    const filteredCourts = courts.filter(court =>
        court.name && court.name.toLowerCase().includes((courtSearch || '').toLowerCase())
    );

    const validate = () => {
        const newErrors = {};
        if (!formData.courtId) newErrors.courtId = 'Vui lòng chọn sân';
        if (!formData.playDate) newErrors.playDate = 'Vui lòng chọn ngày';
        if (!formData.startTime) newErrors.startTime = 'Vui lòng chọn giờ bắt đầu';
        if (!formData.openEnded && !formData.endTime) newErrors.endTime = 'Vui lòng chọn giờ kết thúc';

        if (customerType === 'GUEST') {
            if (!formData.guestName) newErrors.guestName = 'Vui lòng nhập tên khách';
            if (!formData.guestPhone) newErrors.guestPhone = 'Vui lòng nhập số điện thoại';
        } else {
            if (!formData.userId) newErrors.userId = 'Vui lòng chọn khách hàng';
        }

        // Time validation
        if (!formData.openEnded && formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                newErrors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const requestData = {
                courtId: parseInt(formData.courtId),
                playDate: formData.playDate,
                startTime: formData.startTime,
                endTime: !formData.openEnded ? formData.endTime : null,
                initialStatus: formData.initialStatus,
                notes: formData.notes,
                openEnded: formData.openEnded,
                estimatedDurationMinutes: formData.openEnded && formData.estimatedDurationMinutes ? parseInt(formData.estimatedDurationMinutes) : null,
                maxDurationMinutes: formData.openEnded && formData.maxDurationMinutes ? parseInt(formData.maxDurationMinutes) : null
            };

            if (customerType === 'GUEST') {
                requestData.guestName = formData.guestName;
                requestData.guestPhone = formData.guestPhone;
            } else {
                requestData.userId = parseInt(formData.userId);
            }

            await adminBookingService.createWalkInBooking(requestData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating walk-in booking:', error);
            console.error('Error details:', error.response?.data);

            let errorMessage = 'Có lỗi xảy ra khi tạo booking';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }

                // Check for field errors (Spring Validation)
                if (error.response.data.errors) {
                    const fieldErrors = error.response.data.errors;
                    const fieldErrorDetails = Object.entries(fieldErrors)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join(', ');
                    if (fieldErrorDetails) {
                        errorMessage += ` (${fieldErrorDetails})`;
                    }
                }
            }

            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                            <span className="p-2 bg-white/20 rounded-xl">
                                <UserPlus className="w-6 h-6" />
                            </span>
                            Đặt sân tại quầy
                        </h3>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-wider mt-1 ml-11">Walk-in Booking</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/20 rounded-xl transition-all relative z-10 group"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="walkin-form" onSubmit={handleSubmit} className="space-row gap-8">

                        {/* Customer Type Toggle */}
                        <div className="col-span-full bg-slate-50 p-1.5 rounded-2xl flex border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setCustomerType('GUEST')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${customerType === 'GUEST'
                                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 scale-[1.02]'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                Khách vãng lai
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCustomerType('USER');
                                    fetchUsers('');
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${customerType === 'USER'
                                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 scale-[1.02]'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <UserCheck className="w-4 h-4" />
                                Khách đã có tài khoản
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">

                            {/* Customer Info Section */}
                            <div className="col-span-full border-b border-slate-100 pb-4">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    Thông tin khách hàng
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {customerType === 'GUEST' ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên khách hàng *</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        name="guestName"
                                                        value={formData.guestName}
                                                        onChange={handleChange}
                                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none font-bold text-sm text-slate-900 ${errors.guestName ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'
                                                            }`}
                                                        placeholder="Tên khách..."
                                                    />
                                                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                </div>
                                                {errors.guestName && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.guestName}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số điện thoại *</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        name="guestPhone"
                                                        value={formData.guestPhone}
                                                        onChange={handleChange}
                                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none font-bold text-sm text-slate-900 ${errors.guestPhone ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'
                                                            }`}
                                                        placeholder="0123..."
                                                    />
                                                    <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                </div>
                                                {errors.guestPhone && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.guestPhone}</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="col-span-full space-y-2 relative" ref={dropdownRef}>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tìm kiếm khách hàng *</label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={userSearch}
                                                    onChange={(e) => {
                                                        setUserSearch(e.target.value);
                                                        setShowUserDropdown(true);
                                                        if (!e.target.value) setFormData(prev => ({ ...prev, userId: '' }));
                                                    }}
                                                    onFocus={() => setShowUserDropdown(true)}
                                                    className={`w-full pl-11 pr-10 py-3 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none font-bold text-sm text-slate-900 ${errors.userId ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'
                                                        }`}
                                                    placeholder="Nhập tên, email hoặc SĐT..."
                                                />
                                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                {loadingUsers && (
                                                    <Loader2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" />
                                                )}
                                            </div>

                                            {/* User Dropdown */}
                                            {showUserDropdown && (
                                                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50">
                                                    {users.length > 0 ? (
                                                        users.map(user => (
                                                            <div
                                                                key={user.id}
                                                                onClick={() => selectUser(user)}
                                                                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                                                            >
                                                                <p className="text-sm font-bold text-slate-900">{user.fullName} <span className="text-slate-400 font-normal">({user.username})</span></p>
                                                                <p className="text-xs text-slate-500">{user.email} • {user.phoneNumber}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-slate-400 text-xs font-bold">
                                                            {loadingUsers ? 'Đang tìm kiếm...' : 'Không tìm thấy khách hàng'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {errors.userId && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.userId}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Court & Date Section */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sân *</label>
                                <div className="relative" ref={courtDropdownRef}>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={courtSearch}
                                            onChange={(e) => {
                                                setCourtSearch(e.target.value);
                                                setShowCourtDropdown(true);
                                                if (!e.target.value) setFormData(prev => ({ ...prev, courtId: '' }));
                                            }}
                                            onFocus={() => setShowCourtDropdown(true)}
                                            className={`w-full pl-11 pr-10 py-3 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none font-bold text-sm text-slate-900 ${errors.courtId ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'
                                                }`}
                                            placeholder={loadingCourts ? 'Đang tải danh sách sân...' : 'Chọn hoặc tìm sân...'}
                                            disabled={loadingCourts}
                                        />
                                        <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        {loadingCourts && (
                                            <Loader2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" />
                                        )}
                                    </div>

                                    {/* Court Dropdown */}
                                    {showCourtDropdown && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50">
                                            {filteredCourts.length > 0 ? (
                                                filteredCourts.map(court => (
                                                    <div
                                                        key={court.id}
                                                        onClick={() => selectCourt(court)}
                                                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex items-center justify-between group"
                                                    >
                                                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{court.name}</span>
                                                        {formData.courtId === court.id && <UserCheck className="w-4 h-4 text-indigo-600" />}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-slate-400 text-xs font-bold">
                                                    Không tìm thấy sân phù hợp
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {errors.courtId && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.courtId}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ngày đánh *</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="playDate"
                                        value={formData.playDate}
                                        onChange={handleChange}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none font-bold text-sm text-slate-900 ${errors.playDate ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'
                                            }`}
                                    />
                                    <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            {/* Time Section */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Giờ bắt đầu *</label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none font-bold text-sm text-slate-900 ${errors.startTime ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'
                                            }`}
                                    />
                                    <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between items-center">
                                    <span>Giờ kết thúc {formData.openEnded ? '(Tự do)' : '*'}</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="openEnded"
                                            checked={formData.openEnded}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    openEnded: e.target.checked,
                                                    // If enabling openEnded, maybe clear endTime or keep it distinct
                                                }));
                                                // Clear end time error if switching to open ended
                                                if (e.target.checked && errors.endTime) {
                                                    setErrors(prev => ({ ...prev, endTime: null }));
                                                }
                                            }}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-[9px] font-bold text-indigo-600">Chơi tự do</span>
                                    </label>
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        disabled={formData.openEnded}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border-2 rounded-2xl focus:bg-white transition-all outline-none font-bold text-sm text-slate-900 ${formData.openEnded ? 'opacity-50 cursor-not-allowed border-slate-100' :
                                            errors.endTime ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'
                                            }`}
                                    />
                                    <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                {errors.endTime && !formData.openEnded && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.endTime}</p>}

                                {/* Estimated Duration for Open Ended */}
                                {formData.openEnded && (
                                    <div className="mt-2 grid grid-cols-2 gap-3 animate-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider ml-1">Dự kiến (phút)</label>
                                            <input
                                                type="number"
                                                name="estimatedDurationMinutes"
                                                value={formData.estimatedDurationMinutes}
                                                onChange={handleChange}
                                                placeholder="VD: 120"
                                                className="w-full px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 placeholder:text-indigo-300 outline-none focus:border-indigo-300"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider ml-1">Tối đa (Soft Block)</label>
                                            <input
                                                type="number"
                                                name="maxDurationMinutes"
                                                value={formData.maxDurationMinutes}
                                                onChange={handleChange}
                                                placeholder="VD: 240"
                                                className="w-full px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 placeholder:text-indigo-300 outline-none focus:border-indigo-300"
                                                title="Thời gian tối đa để cảnh báo khách online (Soft Block)"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Initial Status */}
                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trạng thái khởi tạo</label>
                                <div className="flex gap-4">
                                    <label className="flex-1 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="initialStatus"
                                            value="PLAYING"
                                            checked={formData.initialStatus === 'PLAYING'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${formData.initialStatus === 'PLAYING'
                                            ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-50'
                                            : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                            }`}>
                                            <div>
                                                <p className={`font-black text-xs uppercase tracking-wider ${formData.initialStatus === 'PLAYING' ? 'text-indigo-700' : 'text-slate-600'}`}>Đang chơi (PLAYING)</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Vào sân ngay lập tức</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.initialStatus === 'PLAYING' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                {formData.initialStatus === 'PLAYING' && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>}
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="initialStatus"
                                            value="CONFIRMED"
                                            checked={formData.initialStatus === 'CONFIRMED'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${formData.initialStatus === 'CONFIRMED'
                                            ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-50'
                                            : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                            }`}>
                                            <div>
                                                <p className={`font-black text-xs uppercase tracking-wider ${formData.initialStatus === 'CONFIRMED' ? 'text-emerald-700' : 'text-slate-600'}`}>Xác nhận (CONFIRMED)</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Sắp vào sân</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.initialStatus === 'CONFIRMED' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                                                {formData.initialStatus === 'CONFIRMED' && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>}
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ghi chú</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-sm text-slate-900 resize-none"
                                    placeholder="Ghi chú thêm (khung giờ, khách quen...)"
                                />
                            </div>

                            {errors.submit && (
                                <div className="col-span-full bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                                    <p className="text-xs font-bold text-rose-600">{errors.submit}</p>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-[0.2em]"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        form="walkin-form"
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:scale-[1.01] active:scale-[0.99] transition-all font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Tạo đặt sân ngay
                            </>
                        )}
                    </button>
                </div>
            </div >
        </div >
    );
};

export default WalkInBookingModal;
