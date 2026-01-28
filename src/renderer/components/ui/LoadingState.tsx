import { motion } from "framer-motion"

export function LoadingState() {
  return (
    <motion.div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-border border-t-accent size-10 animate-spin rounded-full border-3" />
      <motion.span
        className="text-text-secondary text-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Loading your results...
      </motion.span>
    </motion.div>
  )
}
