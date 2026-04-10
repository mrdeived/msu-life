export type ToastType = "success" | "error";

export interface ToastPayload {
  message: string;
  type: ToastType;
}

type Listener = (payload: ToastPayload) => void;

let _listener: Listener | null = null;

export function _registerToastListener(fn: Listener) {
  _listener = fn;
}

export function toast(message: string, type: ToastType = "success") {
  _listener?.({ message, type });
}
