import type { UpdateInfo } from "@/shared/types/update"
import { IconDownload, IconX } from "@tabler/icons-react"
import { motion } from "framer-motion"

interface UpdateNotificationProps {
  info: UpdateInfo
  onInstall: () => void
  onDismiss: () => void
}

export function UpdateNotification({
  info,
  onInstall,
  onDismiss
}: UpdateNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="border-border bg-surface fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]"
    >
      <div className="bg-pass-dim text-pass flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        <IconDownload size={20} stroke={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-text font-medium">Update Ready</p>
        <p className="text-text-secondary mt-0.5 text-sm">
          Version {info.version} has been downloaded
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onInstall}
            className="bg-pass text-text-inverse rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Restart Now
          </button>
          <button
            onClick={onDismiss}
            className="text-text-tertiary hover:text-text rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            Later
          </button>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-text-tertiary hover:text-text shrink-0 transition-colors"
      >
        <IconX size={18} stroke={2} />
      </button>
    </motion.div>
  )
}
