import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconSettings,
  IconDownload,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconSparkles,
} from "@tabler/icons-react";
import type { UpdateState } from "@/shared/types/update";

const { electronAPI } = window;

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [updateState, setUpdateState] = useState<UpdateState | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      electronAPI.getUpdateState().then(setUpdateState);
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubProgress = electronAPI.onUpdateProgress((progress) => {
      setUpdateState((prev) =>
        prev ? { ...prev, downloading: true, progress } : null,
      );
    });
    const unsubDownloaded = electronAPI.onUpdateDownloaded((info) => {
      setUpdateState((prev) =>
        prev ? { ...prev, downloading: false, downloaded: true, info } : null,
      );
    });
    const unsubError = electronAPI.onUpdateError((error) => {
      setUpdateState((prev) =>
        prev ? { ...prev, checking: false, downloading: false, error } : null,
      );
    });
    const unsubNotAvailable = electronAPI.onUpdateNotAvailable(() => {
      setUpdateState((prev) =>
        prev ? { ...prev, checking: false, available: false } : null,
      );
    });
    return () => {
      unsubProgress();
      unsubDownloaded();
      unsubError();
      unsubNotAvailable();
    };
  }, []);

  const handleCheckForUpdates = async () => {
    setUpdateState((prev) =>
      prev
        ? { ...prev, checking: true, error: null }
        : {
            checking: true,
            available: false,
            downloading: false,
            downloaded: false,
            error: null,
            info: null,
            progress: null,
          },
    );
    await electronAPI.checkForUpdates();
  };

  const handleInstall = () => {
    electronAPI.installUpdate();
  };

  const getStatusDisplay = () => {
    if (!updateState) return null;

    if (updateState.checking) {
      return {
        icon: IconLoader2,
        text: "Checking...",
        color: "text-accent",
        spin: true,
      };
    }
    if (updateState.downloading) {
      return {
        icon: IconDownload,
        text: `Downloading ${updateState.progress ?? 0}%`,
        color: "text-accent",
        spin: false,
      };
    }
    if (updateState.downloaded && updateState.info) {
      return {
        icon: IconSparkles,
        text: `v${updateState.info.version} ready`,
        color: "text-pass",
        spin: false,
      };
    }
    if (updateState.error) {
      return {
        icon: IconAlertCircle,
        text: updateState.error,
        color: "text-fail",
        spin: false,
      };
    }
    if (updateState.available === false && !updateState.checking) {
      return {
        icon: IconCheck,
        text: "Up to date",
        color: "text-pass",
        spin: false,
      };
    }
    return null;
  };

  const status = getStatusDisplay();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="border-border bg-elevated text-text-secondary hover:border-border-medium hover:bg-hover hover:text-text flex items-center justify-center rounded-lg border p-2 transition-all duration-150 active:scale-[0.98]"
      >
        <motion.div
          animate={{ rotate: isHovered || isOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <IconSettings size={18} stroke={2} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="border-border bg-surface/95 absolute top-full right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border p-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            <div className="p-2">
              <div className="text-text-tertiary mb-2 text-xs font-medium tracking-wider uppercase">
                Updates
              </div>

              {status && (
                <div className="mb-3 flex items-start gap-2">
                  {(() => {
                    const StatusIcon = status.icon;
                    return (
                      <StatusIcon
                        size={14}
                        stroke={2}
                        className={`${status.color} ${status.spin ? "animate-spin" : ""} mt-0.5 shrink-0`}
                      />
                    );
                  })()}
                  <span className={`text-sm ${status.color} break-words`}>
                    {status.text}
                  </span>
                </div>
              )}

              {updateState?.downloading && updateState.progress !== null && (
                <div className="bg-border mb-3 h-1 overflow-hidden rounded-full">
                  <motion.div
                    className="bg-accent h-full shadow-[0_0_8px_rgba(0,255,159,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${updateState.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {updateState?.downloaded ? (
                <button
                  onClick={handleInstall}
                  className="bg-pass text-text-inverse flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                >
                  <IconDownload size={16} stroke={2} />
                  Install & Restart
                </button>
              ) : (
                <button
                  onClick={handleCheckForUpdates}
                  disabled={updateState?.checking || updateState?.downloading}
                  className="border-border bg-elevated text-text hover:border-border-medium hover:bg-hover flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all disabled:opacity-50"
                >
                  <IconDownload size={16} stroke={2} />
                  Check for Updates
                </button>
              )}
            </div>

            <div className="bg-border my-1 h-px" />

            <div className="text-text-tertiary p-2 text-xs">
              EPIDASH v{__APP_VERSION__ ?? "dev"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
