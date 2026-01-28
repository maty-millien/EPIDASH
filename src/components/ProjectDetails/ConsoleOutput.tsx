import { IconCheck, IconCopy } from "@tabler/icons-react"
import { useEffect, useMemo, useRef, useState } from "react"

interface ConsoleOutputProps {
  output: string
}

interface StyledLine {
  text: string
  className: string
}

function styleLine(line: string): StyledLine {
  // Section headers (==== ex00 ====)
  if (line.match(/^=+$/)) {
    return { text: line, className: "text-text-tertiary" }
  }
  if (line.match(/^\s*ex\d+\s*$/i) || line.match(/^=+\s*\w+\s*=+$/)) {
    return { text: line, className: "text-accent font-bold" }
  }

  // Building/Checking messages (before general # comments)
  if (
    line.startsWith("# Building") ||
    line.startsWith("# Checking") ||
    line.startsWith("# Executing")
  ) {
    return { text: line, className: "text-[#bb9af7] italic" }
  }

  // Success messages
  if (
    line.includes("SUCCESS") ||
    line.includes("# OK") ||
    line.match(/:\s*OK\s*$/)
  ) {
    return { text: line, className: "text-pass font-semibold" }
  }

  // Comments (starting with #)
  if (line.startsWith("#")) {
    return { text: line, className: "text-text-tertiary" }
  }

  // Shell commands
  if (line.startsWith("~/.>") || line.startsWith("$ ")) {
    return { text: line, className: "text-[#7aa2f7]" }
  }

  // Failure messages
  if (
    line.includes("FAILURE") ||
    line.includes("FAILED") ||
    line.includes("error:") ||
    line.includes("Error:") ||
    line.includes("TIMEOUT")
  ) {
    return { text: line, className: "text-fail font-medium" }
  }

  // Warnings
  if (line.includes("warning:") || line.includes("Warning:")) {
    return { text: line, className: "text-warning" }
  }

  // Compiler commands
  if (line.includes("clang") || line.includes("g++") || line.includes("gcc")) {
    return { text: line, className: "text-text-secondary" }
  }

  // Default
  return { text: line, className: "text-text" }
}

export function ConsoleOutput({ output }: ConsoleOutputProps) {
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const lines = useMemo(() => output.split("\n"), [output])
  const styledLines = useMemo(() => lines.map(styleLine), [lines])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [output])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-surface border-border overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
          Build Output
        </h2>

        <button
          onClick={handleCopy}
          className="text-text-tertiary hover:text-text hover:bg-hover flex items-center gap-1.5 rounded-md px-3 py-2 text-xs transition-colors duration-150"
        >
          {copied ? (
            <>
              <IconCheck size={14} stroke={2} className="text-pass" />
              Copied
            </>
          ) : (
            <>
              <IconCopy size={14} stroke={2} />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="border-border border-t">
        <div
          ref={scrollRef}
          className="bg-elevated max-h-150 overflow-auto p-4"
        >
          <pre className="font-mono text-xs leading-relaxed">
            {styledLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="text-text-tertiary mr-6 w-8 shrink-0 text-right opacity-50 select-none">
                  {i + 1}
                </span>
                <span
                  className={`${line.className} wrap-break-word whitespace-pre-wrap`}
                >
                  {line.text || "\u00A0"}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}
