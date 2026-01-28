import { motion } from "framer-motion"

export function LoadingState() {
  return (
    <div className="bg-void fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="border-border border-t-accent size-10 animate-spin rounded-full border-3" />
      </motion.div>
    </div>
  )
}
