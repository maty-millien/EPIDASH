import { IconBrandGithub } from "@tabler/icons-react";

const { electronAPI } = window;

export function AppFooter() {
  return (
    <footer className="mt-4 px-4 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-text-tertiary font-mono text-xs">
          EPIDASH v0.1.12
        </span>

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
