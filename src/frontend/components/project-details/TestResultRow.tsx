import {
  IconAlertTriangle,
  IconCheck,
  IconFlame,
  IconPlayerSkipForward,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { TestResult } from "@/shared/types/api";

interface TestResultRowProps {
  test: TestResult;
}

export function TestResultRow({ test }: TestResultRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasComment = test.comment && test.comment.length > 0;

  const getStatusIcon = () => {
    if (test.skipped) {
      return (
        <IconPlayerSkipForward
          size={14}
          stroke={2}
          className="text-text-tertiary"
        />
      );
    }
    if (test.crashed) {
      return <IconFlame size={14} stroke={2} className="text-crash" />;
    }
    if (test.passed) {
      return <IconCheck size={14} stroke={2} className="text-pass" />;
    }
    return <IconX size={14} stroke={2} className="text-fail" />;
  };

  const getStatusText = () => {
    if (test.skipped) return "SKIPPED";
    if (test.crashed) return "CRASHED";
    if (test.passed) return "PASSED";
    return "FAILED";
  };

  const getStatusColor = () => {
    if (test.skipped) return "text-text-tertiary";
    if (test.crashed) return "text-crash";
    if (test.passed) return "text-pass";
    return "text-fail";
  };

  const getBgColor = () => {
    if (test.skipped) return "bg-elevated";
    if (test.crashed) return "bg-crash-dim";
    if (test.passed) return "bg-pass-dim";
    return "bg-fail-dim";
  };

  return (
    <div className="rounded-lg">
      <div
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${hasComment ? "cursor-pointer" : ""} ${getBgColor()}`}
        onClick={() => hasComment && setExpanded(!expanded)}
      >
        <div className="flex size-5 shrink-0 items-center justify-center">
          {getStatusIcon()}
        </div>

        <span className="text-text flex-1 truncate text-sm">{test.name}</span>

        <div className="flex items-center gap-2">
          {test.mandatory && (
            <span className="text-warning flex items-center gap-1 text-xs">
              <IconAlertTriangle size={12} stroke={2} />
              mandatory
            </span>
          )}
          <span className={`font-mono text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && hasComment && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="bg-elevated mt-1 rounded-lg p-3">
              <pre className="text-fail overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {test.comment}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
