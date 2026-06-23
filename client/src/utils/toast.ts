import toast from "react-hot-toast";

export const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "success"
) => {
  const toastOptions = {
    style: {
      borderRadius: "10px",
      background: "#333",
      color: "#fff",
      padding: "16px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    duration: 3000,
  };

  switch (type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "info":
      toast(message, { ...toastOptions, icon: 'ℹ️' });
      break;
    case "warning":
      toast(message, { ...toastOptions, icon: '⚠️' });
      break;
    default:
      toast.success(message, toastOptions);
  }
};