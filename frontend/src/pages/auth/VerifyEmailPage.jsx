import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../axiosConfig/axiosConfig";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const token = searchParams.get("token");
  const verificationValue = code || token;
  const storageKey = useMemo(
    () => (verificationValue ? `verify-email:${verificationValue}` : null),
    [verificationValue]
  );
  const [status, setStatus] = useState(verificationValue ? "loading" : "error");
  const [message, setMessage] = useState(
    verificationValue
      ? "Đang xác thực email..."
      : "Thiếu token xác thực. Vui lòng kiểm tra lại link trong email."
  );

  useEffect(() => {
    if (!verificationValue || !storageKey) {
      return;
    }

    let mounted = true;
    let waitTimer = null;

    const setSuccessState = (successMessage) => {
      setStatus("success");
      setMessage(successMessage || "Xác thực email thành công. Bạn có thể đăng nhập.");
    };

    const setErrorState = (errorMessage) => {
      setStatus("error");
      setMessage(
        errorMessage || "Xác thực email thất bại hoặc link đã hết hạn."
      );
    };

    const verifyEmail = async () => {
      sessionStorage.setItem(storageKey, "pending");
      try {
        const res = await axiosClient.get("/auth/verify-email", {
          params: code ? { code } : { token },
        });
        sessionStorage.setItem(storageKey, "done");
        if (!mounted) return;
        setSuccessState(res.data);
      } catch (err) {
        sessionStorage.setItem(storageKey, "error");
        if (!mounted) return;
        setErrorState(err?.response?.data?.message);
      }
    };

    const verifyState = sessionStorage.getItem(storageKey);
    if (verifyState === "done") {
      setSuccessState();
    } else if (verifyState === "pending") {
      const waitStart = Date.now();
      const watchPending = () => {
        if (!mounted) return;
        const latestState = sessionStorage.getItem(storageKey);

        if (latestState === "done") {
          setSuccessState();
          return;
        }

        if (latestState === "error") {
          setErrorState();
          return;
        }

        if (Date.now() - waitStart > 15000) {
          sessionStorage.removeItem(storageKey);
          verifyEmail();
          return;
        }

        waitTimer = window.setTimeout(watchPending, 250);
      };
      watchPending();
    } else {
      verifyEmail();
    }

    return () => {
      mounted = false;
      if (waitTimer) {
        window.clearTimeout(waitTimer);
      }
    };
  }, [code, token, verificationValue, storageKey]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Xác thực email</h1>

        {status === "loading" && (
          <p className="text-sm text-gray-600">{message}</p>
        )}

        {status === "success" && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            {message}
          </p>
        )}

        {status === "error" && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {message}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/login", { state: { mode: "login" } })}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Đi đến đăng nhập
          </button>
          <button
            type="button"
            onClick={() => navigate("/login", { state: { mode: "register" } })}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Đăng ký lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
