import { useState, useEffect } from 'react';

const CheckInCountdown = ({ checkInDeadline, status }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị countdown cho booking đã thanh toán deposit nhưng chưa check-in
    if (status !== 'PAYMENT_CONFIRMED' && status !== 'CONFIRMED') {
      return;
    }

    if (!checkInDeadline) return;

    const updateCountdown = () => {
      const now = new Date();
      const deadline = new Date(checkInDeadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Đã hết hạn');
        setIsExpired(true);
        setIsUrgent(false);
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        if (hours > 0) {
          setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }

        // Urgent nếu còn dưới 10 phút
        setIsUrgent(diff < 600000);
        setIsExpired(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [checkInDeadline, status]);

  if (status !== 'PAYMENT_CONFIRMED' && status !== 'CONFIRMED') {
    return null;
  }

  if (!checkInDeadline) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
        isExpired
          ? 'bg-red-100 text-red-700 border border-red-200'
          : isUrgent
          ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
          : 'bg-blue-100 text-blue-700 border border-blue-200'
      }`}
    >
      <span className="material-symbols-outlined text-base">
        {isExpired ? 'error' : 'schedule'}
      </span>
      <span>
        {isExpired ? 'Đã hết hạn check-in' : `Check-in trong: ${timeLeft}`}
      </span>
    </div>
  );
};

export default CheckInCountdown;
