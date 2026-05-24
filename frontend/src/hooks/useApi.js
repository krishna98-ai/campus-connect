import { useState, useCallback } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

/**
 * Generic API hook — handles loading, error and success states.
 * Usage: const { execute, data, loading, error } = useApi();
 *        await execute(() => api.get('/some-endpoint'));
 */
export default function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFn, { showError = true, showSuccess = false, successMsg = 'Done!' } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
      if (showSuccess) toast.success(successMsg);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
      if (showError) toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
