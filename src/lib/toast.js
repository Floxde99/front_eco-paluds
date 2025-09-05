import { toast as sonner } from 'sonner'

// Small wrapper to apply consistent classes and icons for success / error toasts
export function success(message, opts = {}) {
  return sonner.success(message, {
    className:
      "bg-green-50 text-green-900 border border-green-200 shadow-green-100 rounded-lg px-4 py-2",
    icon: '✅',
    ...opts,
  })
}

export function error(message, opts = {}) {
  return sonner.error(message, {
    className:
      "bg-red-50 text-red-900 border border-red-200 shadow-red-100 rounded-lg px-4 py-2 animate-pulse",
    icon: '❌',
    ...opts,
  })
}

export function info(message, opts = {}) {
  return sonner(message, {
    className: "bg-blue-50 text-blue-900 border border-blue-200 shadow-blue-100 rounded-lg px-4 py-2",
    ...opts,
  })
}

export default {
  success,
  error,
  info,
}
