import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { findPaymentByTxnRef } from "../services/FinanceService";

const VnpayReturnPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("processing"); // processing, success, failed
  const [message, setMessage] = useState("");
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    const handleVnpayReturn = async () => {
      try {
        // Get query parameters from URL
        const urlParams = new URLSearchParams(location.search);
        const vnpResponseCode = urlParams.get("vnp_ResponseCode");
        const vnpTxnRef = urlParams.get("vnp_TxnRef");

        console.log("VNPay return params:", {
          vnpResponseCode,
          vnpTxnRef,
          allParams: Object.fromEntries(urlParams.entries())
        });

        if (vnpResponseCode === "00") {
          // Payment successful
          setStatus("success");
          setMessage(t("paymentSuccessful") || "Payment completed successfully!");

          // Check if paymentId is directly provided in URL (from backend redirect)
          const paymentIdFromUrl = urlParams.get("paymentId");
          
          if (paymentIdFromUrl) {
            // Payment ID is directly provided by backend
            setPaymentId(paymentIdFromUrl);
            setTimeout(() => {
              navigate(`/management/finance?viewInvoice=${paymentIdFromUrl}`);
            }, 3000);
          } else {
            // Fallback: try to find payment by vnpTxnRef
            try {
              const data = await findPaymentByTxnRef(vnpTxnRef);
              console.log("Payment found by TxnRef:", data);

              if (data.paymentId || data._id) {
                const paymentId = data.paymentId || data._id;
                setPaymentId(paymentId);
                setTimeout(() => {
                  navigate(`/management/finance?viewInvoice=${paymentId}`);
                }, 3000);
              } else {
                setTimeout(() => {
                  navigate("/management/finance");
                }, 3000);
              }
            } catch (error) {
              console.error("Error finding payment by TxnRef:", error);
              setTimeout(() => {
                navigate("/management/finance");
              }, 3000);
            }
          }
        } else {
          // Payment failed
          setStatus("failed");
          setMessage(t("paymentFailed") || "Payment failed. Please try again.");
          
          // Redirect to finance page after 3 seconds
          setTimeout(() => {
            navigate("/management/finance");
          }, 3000);
        }
      } catch (error) {
        console.error("Error handling VNPay return:", error);
        setStatus("failed");
        setMessage(t("errorProcessingPayment") || "Error processing payment.");
        
        setTimeout(() => {
          navigate("/management/finance");
        }, 3000);
      }
    };

    handleVnpayReturn();
  }, [location.search, navigate, t]);

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader className="animate-spin text-blue-500" size={48} />;
      case "success":
        return <CheckCircle className="text-green-500" size={48} />;
      case "failed":
        return <XCircle className="text-red-500" size={48} />;
      default:
        return <Loader className="animate-spin text-blue-500" size={48} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === "processing" && (t("processingPayment") || "Processing Payment...")}
          {status === "success" && (t("paymentSuccessful") || "Payment Successful!")}
          {status === "failed" && (t("paymentFailed") || "Payment Failed")}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {status === "processing" && (
          <p className="text-sm text-gray-500">
            {t("pleaseWait") || "Please wait while we process your payment..."}
          </p>
        )}
        
        {status !== "processing" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              {t("redirectingToFinancePage") || "Redirecting to finance page..."}
            </p>
            <button
              onClick={() => navigate("/management/finance")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("goToFinancePage") || "Go to Finance Page"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VnpayReturnPage; 