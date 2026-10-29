
import { useState } from "react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

export default function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (
    apiFn,
    {
      showError = true,
      showSuccess = false,
      successMsg = "Done!",
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFn();

      setData(result);

      if (showSuccess) {
        toast.success(successMsg);
      }

      return result;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";

      setError(message);

      if (showError) {
        toast.error(message);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}