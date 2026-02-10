import { useState, useEffect } from "react";
import adminBookingService from "../../services/adminBookingService";
import courtService from "../../services/courtService";
import BookingDetailModal from "../../components/admin/BookingDetailModal";
import ExtendBookingModal from "../../components/admin/ExtendBookingModal";
import BookingCheckoutModal from '../../components/admin/BookingCheckoutModal';
import ConfirmStatusDialog from "../../components/admin/ConfirmStatusDialog";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import TableSkeleton from "../../components/common/TableSkeleton";
import Toast from "../../components/common/Toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import WalkInBookingModal from "../../components/admin/WalkInBookingModal";

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    // Pagination & Filtering
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPayment, setFilterPayment] = useState("");
    const [filterCourt, setFilterCourt] = useState("");
    const [sortBy, setSortBy] = useState("bookingDate");
    const [sortDir, setSortDir] = useState("desc");

    // Modals
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [actionBooking, setActionBooking] = useState(null); // Explicit state for action dialog/modal
    const [statusToUpdate, setStatusToUpdate] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // Modals visibility
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showWalkInModal, setShowWalkInModal] = useState(false);

    // Loading states
    const [extendLoading, setExtendLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize, filterStatus, filterPayment, filterCourt, sortBy, sortDir]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bookingsRes, courtsRes] = await Promise.all([
                adminBookingService.getAllBookings({
                    page: currentPage,
                    size: pageSize,
                    status: filterStatus,
                    paymentStatus: filterPayment,
                    courtId: filterCourt,
                    sortBy,
                    sortDir,
                    searchTerm
                }),
                courtService.getAllCourts(0, 100)
            ]);

            setBookings(bookingsRes.content || []);
            setTotalPages(bookingsRes.totalPages || 0);
            setTotalElements(bookingsRes.totalElements || 0);
            setCourts(courtsRes.content || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError("Không thể tải danh sách đặt sân. Vui lòng thử lại sau.");
            showToast("Lỗi khi tải danh sách đặt sân", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async (params = {}) => {
        try {
            const response = await adminBookingService.getAllBookings({
                page: params.page !== undefined ? params.page : currentPage,
                size: params.size !== undefined ? params.size : pageSize,
                status: params.status !== undefined ? params.status : filterStatus,
                paymentStatus: params.paymentStatus !== undefined ? params.paymentStatus : filterPayment,
                courtId: params.courtId !== undefined ? params.courtId : filterCourt,
                sortBy: params.sortBy !== undefined ? params.sortBy : sortBy,
                sortDir: params.sortDir !== undefined ? params.sortDir : sortDir,
                searchTerm: params.searchTerm !== undefined ? params.searchTerm : searchTerm
            });
            setBookings(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            console.error("Error refreshing bookings:", err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchBookings();
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    const handleViewDetail = async (booking) => {
        try {
            setSelectedBooking(booking);
            setShowDetailModal(true);

            // Refetch with full detail API to get lifecycle timestamps
            const fullBooking = await adminBookingService.getBookingById(booking.bookingId);
            setSelectedBooking(fullBooking);
        } catch (err) {
            console.error("Error fetching booking details:", err);
            // Fallback to list data if single fetch fails
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus) => {
        try {
            setLoadingAction(true);
            if (newStatus === 'PLAYING') {
                await adminBookingService.checkIn(bookingId);
                showToast(`Đã check-in đơn #${bookingId} thành công`);
            } else if (newStatus === 'COMPLETED') {
                // Formatting date to ISO-8601 without milliseconds: YYYY-MM-DDTHH:mm:ss
                const now = new Date();
                const pad = (num) => String(num).padStart(2, '0');
                const actualEndTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

                await adminBookingService.completeBooking(bookingId, actualEndTime);
                showToast(`Đã check-out đơn #${bookingId} thành công`);
            } else {
                await adminBookingService.updateBookingStatus(bookingId, newStatus);
                showToast(`Đã cập nhật trạng thái đơn #${bookingId} thành công`);
            }
            fetchBookings();

            // If modal is open, update selected booking
            if (selectedBooking && selectedBooking.bookingId === bookingId) {
                // For COMPLETED and PLAYING, it might be better to refetch details since prices might change
                if (newStatus === 'COMPLETED' || newStatus === 'PLAYING') {
                    const response = await adminBookingService.getBookingById(bookingId);
                    setSelectedBooking(response);
                } else {
                    setSelectedBooking({ ...selectedBooking, status: newStatus });
                }
            }
        } catch (err) {
            console.error("Error updating status:", err);
            showToast(err.response?.data?.message || "Lỗi khi cập nhật trạng thái", "error");
        } finally {
            setLoadingAction(false);
            setShowConfirmDialog(false);
        }
    };



    const initiateStatusUpdate = (booking, newStatus) => {
        // If status is COMPLETED (Check-out), show CheckoutModal instead of ConfirmDialog
        if (newStatus === 'COMPLETED' && booking.status === 'PLAYING') {
            setActionBooking(booking);
            setShowCheckoutModal(true);
            return;
        }

        // Default flow for other statuses
        setActionBooking(booking);
        setStatusToUpdate(newStatus);
        setShowConfirmDialog(true);
    };

    const handleConfirmStatusUpdate = async () => {
        if (!actionBooking || !statusToUpdate) return;

        try {
            setLoadingAction(true);
            await adminBookingService.updateBookingStatus(actionBooking.bookingId, statusToUpdate);
            showToast(`Cập nhật trạng thái thành công: ${statusToUpdate}`);
            fetchBookings(); // Refresh list
        } catch (error) {
            console.error(error);
            showToast("Có lỗi xảy ra khi cập nhật trạng thái", "error");
        } finally {
            setLoadingAction(false);
            setShowConfirmDialog(false);
            setActionBooking(null);
            setStatusToUpdate(null);
        }
    };

    const handleCheckoutConfirm = async () => {
        if (!actionBooking) return;

        try {
            setLoadingAction(true);
            const now = new Date();
            const actualEndTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            await adminBookingService.completeBooking(actionBooking.bookingId, actualEndTime);
            showToast("Check-out và thanh toán thành công!");
            fetchBookings();
        } catch (error) {
            console.error(error);
            showToast("Có lỗi xảy ra khi check-out", "error");
        } finally {
            setLoadingAction(false);
            setShowCheckoutModal(false);
            setActionBooking(null);
        }
    };

    const handleUpdatePaymentStatus = async (bookingId, newPaymentStatus) => {
        try {
            await adminBookingService.updatePaymentStatus(bookingId, newPaymentStatus);
            showToast(`Đã cập nhật trạng thái thanh toán #${bookingId}`);
            fetchBookings();
        } catch (err) {
            showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán', "error");
        }
    };



    const handleExtendClick = (booking) => {
        setSelectedBooking(booking);
        setShowExtendModal(true);
    };

    const handleExtendConfirm = async (bookingId, extensionMinutes, newEndTime) => {
        try {
            setExtendLoading(true);
            await adminBookingService.extendBooking(bookingId, extensionMinutes, newEndTime);
            showToast(`Gia hạn đơn #${bookingId} thành công`);
            setShowExtendModal(false);
            fetchBookings();
        } catch (err) {
            showToast(err.response?.data?.message || "Không thể gia hạn đơn", "error");
        } finally {
            setExtendLoading(false);
        }
    };

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
    };

    const handleApproveCancellation = async (bookingId) => {
        try {
            setLoadingAction(true);
            await adminBookingService.approveCancellation(bookingId);
            showToast(`Đã duyệt hủy đơn #${bookingId}`);
            await fetchBookings();
        } catch (err) {
            showToast(err.response?.data?.message || "Lỗi khi duyệt hủy yêu cầu", "error");
        } finally {
            setLoadingAction(false);
        }
    };

    const handleRejectCancellation = async (bookingId) => {
        try {
            setLoadingAction(true);
            await adminBookingService.rejectCancellation(bookingId);
            showToast(`Đã từ chối hủy đơn #${bookingId}`);
            await fetchBookings();
        } catch (err) {
            showToast(err.response?.data?.message || "Lỗi khi từ chối yêu cầu hủy", "error");
        } finally {
            setLoadingAction(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Đang chờ' },
            PENDING_PAYMENT: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Chờ thanh toán' },
            CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Đã xác nhận' },
            PLAYING: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Đang chơi' },
            COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Hoàn thành' },
            CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Đã hủy' },
            NO_SHOW: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'Không đến' },
            CANCELLATION_REQUESTED: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Yêu cầu hủy' }
        };
        const style = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: status };
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
                {style.label}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const config = {
            PAID: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Đã thanh toán' },
            DEPOSIT_PAID: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Đã cọc' },
            UNPAID: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Chưa thanh toán' },
            REFUNDED: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Đã hoàn tiền' }
        };
        const style = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: status };
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
                {style.label}
            </span>
        );
    };

    const getBookingTypeBadge = (type) => {
        if (type === 'WALK_IN') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">storefront</span>
                    Tại quầy
                </span>
            );
        }
        // Default to Online
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">public</span>
                Online
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                {/* Page Header */}
                <PageHeader
                    title="Quản lý đặt sân"
                    subtitle="Theo dõi và quản lý toàn bộ các đơn đặt sân trên hệ thống."
                    actions={
                        <>
                            <button
                                onClick={() => setShowWalkInModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined text-lg">add_circle</span>
                                Đặt sân tại quầy
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-lg">download</span>
                                Xuất Excel
                            </button>
                        </>
                    }
                />

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Tổng lượt đặt"
                        value="1,248"
                        change="+12.5%"
                        trend="up"
                        icon="calendar_month"
                        iconBg="bg-purple-100"
                        iconColor="text-purple-600"
                    />
                    <StatCard
                        title="Hoàn thành"
                        value="942"
                        change="+8.2%"
                        trend="up"
                        icon="check_circle"
                        iconBg="bg-green-100"
                        iconColor="text-green-600"
                    />
                    <StatCard
                        title="Đang chờ"
                        value="12"
                        change="-2.1%"
                        trend="down"
                        icon="pending_actions"
                        iconBg="bg-amber-100"
                        iconColor="text-amber-600"
                    />
                    <StatCard
                        title="Doanh thu"
                        value="42.8M"
                        change="+15.4%"
                        trend="up"
                        icon="payments"
                        iconBg="bg-blue-100"
                        iconColor="text-blue-600"
                    />
                </div>

                {/* Filters & Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    {/* Search & Filters */}
                    <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-500"
                                placeholder="Tìm kiếm khách hàng, SĐT..."
                            />
                        </form>

                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 cursor-pointer outline-none transition-all"
                                >
                                    <option value="">Trạng thái: Tất cả</option>
                                    <option value="PENDING">Đang chờ</option>
                                    <option value="CONFIRMED">Đã xác nhận</option>
                                    <option value="PLAYING">Đang chơi</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                    <option value="CANCELLATION_REQUESTED">Yêu cầu hủy</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
                            </div>

                            <div className="relative">
                                <select
                                    value={filterPayment}
                                    onChange={(e) => {
                                        setFilterPayment(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 cursor-pointer outline-none transition-all"
                                >
                                    <option value="">Thanh toán: Tất cả</option>
                                    <option value="PAID">Đã thanh toán</option>
                                    <option value="UNPAID">Chưa thanh toán</option>
                                    <option value="REFUNDED">Đã hoàn tiền</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
                            </div>

                            <div className="relative">
                                <select
                                    value={filterCourt}
                                    onChange={(e) => {
                                        setFilterCourt(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-sm font-medium text-gray-900 cursor-pointer outline-none transition-all"
                                >
                                    <option value="">Sân: Tất cả</option>
                                    {courts.map((court) => (
                                        <option key={court.id} value={court.id}>
                                            {court.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
                            </div>

                            <button
                                onClick={fetchData}
                                className="px-3 py-2.5 rounded-lg bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                                title="Lọc"
                            >
                                <span className="material-symbols-outlined text-xl">filter_list</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="overflow-x-auto">
                            <TableSkeleton rows={10} columns={6} />
                        </div>
                    ) : error ? (
                        <div className="p-20 text-center space-y-4">
                            <span className="material-symbols-outlined text-red-500 text-6xl">error</span>
                            <h3 className="text-xl font-bold text-gray-900">Lỗi không mong muốn</h3>
                            <p className="text-gray-500">{error}</p>
                            <button
                                onClick={fetchData}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-600 font-semibold">
                                        <th className="p-4 min-w-[150px]">Mã đơn</th>
                                        <th className="p-4 min-w-[200px]">Khách hàng</th>
                                        <th className="p-4 min-w-[150px]">Lịch chơi</th>
                                        <th className="p-4">Sân</th>
                                        <th className="p-4">Thanh toán</th>
                                        <th className="p-4">Trạng thái</th>
                                        <th className="p-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-12 text-center text-gray-500">
                                                Không tìm thấy đơn đặt sân nào
                                            </td>
                                        </tr>
                                    ) : (
                                        bookings.map((booking) => (
                                            <tr key={booking.bookingId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-gray-900">#{booking.bookingId}</span>
                                                        {getBookingTypeBadge(booking.bookingType)}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900">{booking.customerName}</span>
                                                        <span className="text-gray-600 text-xs">{booking.customerPhone}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{formatDate(booking.bookingDate || booking.playDate)}</span>
                                                        <span className="text-gray-600 text-xs">
                                                            {booking.startTime && booking.endTime
                                                                ? `${booking.startTime} - ${booking.endTime}`
                                                                : booking.openEnded
                                                                    ? 'Chưa kết thúc (Open)'
                                                                    : 'Chưa xác định'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-900 font-medium">{booking.courtName}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</span>
                                                        {getPaymentBadge(booking.paymentStatus)}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(booking.status)}
                                                    {booking.status === 'CANCELLATION_REQUESTED' && booking.notes && (
                                                        <p className="mt-1 text-[10px] text-orange-600 font-medium max-w-[150px] truncate" title={booking.notes}>
                                                            💬 {booking.notes
                                                                .split('\n')
                                                                .filter(line => line.includes('Cancellation requested by user:'))
                                                                .map(line => line.replace('Cancellation requested by user:', '').trim())
                                                                .filter(Boolean)
                                                                .join(', ') || booking.notes}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewDetail(booking)}
                                                            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                                        </button>

                                                        <div className="relative group/actions">
                                                            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                                                                <span className="material-symbols-outlined text-lg">more_vert</span>
                                                            </button>

                                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/actions:opacity-100 group-hover/actions:visible transition-all z-20 overflow-hidden">
                                                                {booking.status === 'PLAYING' && (
                                                                    <button
                                                                        onClick={() => handleExtendClick(booking)}
                                                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                                                                    >
                                                                        <span className="material-symbols-outlined text-base">history</span>
                                                                        Gia hạn thêm giờ
                                                                    </button>
                                                                )}

                                                                {booking.status === 'PENDING' && (
                                                                    <button
                                                                        onClick={() => initiateStatusUpdate(booking, 'CONFIRMED')}
                                                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                                    >
                                                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                                                        Xác nhận đơn
                                                                    </button>
                                                                )}

                                                                {booking.status === 'CANCELLATION_REQUESTED' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleApproveCancellation(booking.bookingId)}
                                                                            disabled={loadingAction}
                                                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-green-600 hover:bg-green-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            <span className="material-symbols-outlined text-base">check</span>
                                                                            {loadingAction ? 'Đang xử lý...' : 'Duyệt hủy'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectCancellation(booking.bookingId)}
                                                                            disabled={loadingAction}
                                                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            <span className="material-symbols-outlined text-base">close</span>
                                                                            {loadingAction ? 'Đang xử lý...' : 'Từ chối hủy'}
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLATION_REQUESTED' && (
                                                                    <button
                                                                        onClick={() => handleCancelClick(booking)}
                                                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                    >
                                                                        <span className="material-symbols-outlined text-base">cancel</span>
                                                                        Hủy đơn này
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-600">
                                Hiển thị <span className="font-bold text-gray-900">{currentPage * pageSize + 1}</span> đến{' '}
                                <span className="font-bold text-gray-900">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trong tổng số{' '}
                                <span className="font-bold text-gray-900">{totalElements.toLocaleString()}</span> kết quả
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>
                                <div className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-bold">
                                    {currentPage + 1} / {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    courts={courts}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedBooking(null);
                    }}
                    onUpdateStatus={handleUpdateStatus}
                    onExtend={handleExtendClick}
                    loading={loadingAction}
                />
            )}

            {/* Extend Modal */}
            {showExtendModal && selectedBooking && (
                <ExtendBookingModal
                    booking={selectedBooking}
                    onClose={() => {
                        setShowExtendModal(false);
                        setSelectedBooking(null);
                    }}
                    onConfirm={handleExtendConfirm}
                    loading={extendLoading}
                />
            )}

            {/* Confirm Status Dialog */}
            {showConfirmDialog && actionBooking && (
                <ConfirmStatusDialog
                    booking={actionBooking}
                    newStatus={statusToUpdate}
                    onConfirm={handleConfirmStatusUpdate}
                    onCancel={() => {
                        setShowConfirmDialog(false);
                        setActionBooking(null);
                        setStatusToUpdate(null);
                    }}
                    loading={loadingAction}
                />
            )}

            {showCheckoutModal && actionBooking && (
                <BookingCheckoutModal
                    booking={actionBooking}
                    onConfirm={handleCheckoutConfirm}
                    onCancel={() => {
                        setShowCheckoutModal(false);
                        setActionBooking(null);
                    }}
                    loading={loadingAction}
                />
            )}

            {/* Delete/Cancel Confirmation */}
            <ConfirmDialog
                isOpen={showCancelModal}
                title="Xác nhận hủy"
                message={`Bạn có chắc chắn muốn hủy đơn đặt sân #${selectedBooking?.bookingId} không?`}
                onConfirm={() => handleUpdateStatus(selectedBooking.bookingId, 'CANCELLED')}
                onCancel={() => setShowCancelModal(false)}
                loading={loadingAction}
            />

            {/* Walk-in Booking Modal */}
            <WalkInBookingModal
                isOpen={showWalkInModal}
                onClose={() => setShowWalkInModal(false)}
                onSuccess={() => {
                    showToast('Đã tạo đặt sân tại quầy thành công');

                    // Reset filters and sort to ensure new booking is visible
                    setFilterStatus('');
                    setFilterPayment('');
                    setSearchTerm('');
                    setSortBy('bookingDate');
                    setSortDir('desc');

                    // If we are definitely changing page to 0, useEffect will handle fetch.
                    // But if we are ALREADY on page 0 and other filters match defaults, useEffect won't run.
                    // So we force fetch with explicit default params to be safe and immediate.
                    fetchBookings({
                        page: 0,
                        status: '',
                        paymentStatus: '',
                        searchTerm: '',
                        sortBy: 'bookingDate',
                        sortDir: 'desc'
                    });

                    // Also update state to match (if not already)
                    setCurrentPage(0);
                }}
                courts={courts}
            />

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default BookingManagement;
