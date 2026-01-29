import { IconBrandGithub } from "@tabler/icons-react";
import { motion } from "framer-motion";

const { electronAPI } = window;

interface AppFooterProps {
  lastSyncTime: Date | null;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AppFooter({ lastSyncTime }: AppFooterProps) {
  const isRecentSync =
    lastSyncTime && Date.now() - lastSyncTime.getTime() < 5 * 60 * 1000;

  return (
    <footer className="mt-4 px-4 pt-4">
      <div className="flex items-center justify-between">
        <span className="text-text-tertiary font-mono text-xs">
          EPIDASH v0.1.12
        </span>

        <div className="flex items-center gap-2">
          {isRecentSync && (
            <motion.div
              className="bg-accent h-1.5 w-1.5 rounded-full"
              animate={{
                opacity: [1, 0.4, 1],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          <span className="text-text-tertiary text-xs">
            {lastSyncTime
              ? `Last sync: ${formatRelativeTime(lastSyncTime)}`
              : "Not synced yet"}
          </span>
        </div>

        <button
          onClick={() =>
            electronAPI.openExternal("https://github.com/maty-millien/EPIDASH")
          }
          className="text-text-tertiary hover:text-accent transition-colors duration-150"
          title="View on GitHub"
        >
          <IconBrandGithub size={18} stroke={1.5} />
        </button>
      </div>
    </footer>
  );
}
