import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
      <Sonner
        theme="light"
        richColors
        position="top-right"
        toastOptions={{
          className: "border shadow-lg rounded-lg p-4 backdrop-blur-sm transition-all animate-in fade-in-50 slide-in-from-right-4 data-[swipe=end]:animate-out data-[swipe=end]:fade-out-50 data-[swipe=end]:slide-out-to-right-4",
          description: "text-sm text-gray-700",
        }}
        {...props}
      />
  );
}

export { Toaster }
