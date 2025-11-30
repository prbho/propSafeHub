// hooks/useToast.ts
import { toast } from 'sonner'

export function useToast() {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
    })
  }

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
    })
  }

  const showLoading = (message: string) => {
    return toast.loading(message)
  }

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }

  return {
    showSuccess,
    showError,
    showLoading,
    dismiss,
  }
}
