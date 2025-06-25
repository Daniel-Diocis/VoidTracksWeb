import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

export const notify = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast.info(msg),
  warning: (msg: string) => toast.warning(msg),
};

export const notifyWithOptions = {
  success: (msg: string, options?: ToastOptions) => toast.success(msg, options),
  error: (msg: string, options?: ToastOptions) => toast.error(msg, options),
  info: (msg: string, options?: ToastOptions) => toast.info(msg, options),
  warning: (msg: string, options?: ToastOptions) => toast.warning(msg, options),
};