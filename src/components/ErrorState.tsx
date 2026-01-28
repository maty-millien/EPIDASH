import { IconAlertCircle } from "@tabler/icons-react"
import { motion } from "framer-motion"

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <IconAlertCircle size={48} stroke={2} className="text-fail" />
      </motion.div>
      <motion.h2
        className="text-text text-lg font-semibold"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Something went wrong
      </motion.h2>
      <motion.p
        className="text-text-secondary max-w-[400px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        {message}
      </motion.p>
      <motion.button
        onClick={onRetry}
        className="bg-accent text-text-inverse mt-2 rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-all duration-150 hover:brightness-110"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        whileTap={{ scale: 0.98 }}
      >
        Try Again
      </motion.button>
    </motion.div>
  )
}
