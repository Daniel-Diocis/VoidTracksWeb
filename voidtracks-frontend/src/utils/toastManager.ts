/**
 * toastManager.ts
 *
 * Wrapper centralizzato per la gestione delle notifiche toast,
 * basato su react-toastify. Fornisce metodi rapidi con e senza opzioni personalizzate.
 */

import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

/**
 * Notifiche standard senza opzioni personalizzate.
 *
 * @property success Mostra un toast di successo.
 * @property error Mostra un toast di errore.
 * @property info Mostra un toast informativo.
 * @property warning Mostra un toast di avviso.
 */
export const notify = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast.info(msg),
  warning: (msg: string) => toast.warning(msg),
};

/**
 * Notifiche con possibilità di passare opzioni personalizzate (es. posizione, autoClose).
 *
 * @property success Mostra un toast di successo con opzioni.
 * @property error Mostra un toast di errore con opzioni.
 * @property info Mostra un toast informativo con opzioni.
 * @property warning Mostra un toast di avviso con opzioni.
 */
export const notifyWithOptions = {
  success: (msg: string, options?: ToastOptions) => toast.success(msg, options),
  error: (msg: string, options?: ToastOptions) => toast.error(msg, options),
  info: (msg: string, options?: ToastOptions) => toast.info(msg, options),
  warning: (msg: string, options?: ToastOptions) => toast.warning(msg, options),
};