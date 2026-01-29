import { execSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

if (process.platform !== "darwin") {
  console.log(
    `Skipping latest-mac.yml generation on ${process.platform} (only runs on macOS)`,
  );
  process.exit(0);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
const version = pkg.version;

const zipPath = join(
  ROOT,
  `out/make/zip/darwin/arm64/EPIDASH-darwin-arm64-${version}.zip`,
);
const zipFilename = `EPIDASH-darwin-arm64-${version}.zip`;

console.log(`Generating latest-mac.yml for v${version}...`);

const zipBuffer = readFileSync(zipPath);
const sha512 = createHash("sha512").update(zipBuffer).digest("base64");
const size = statSync(zipPath).size;

const yml = `version: ${version}
files:
  - url: ${zipFilename}
    sha512: ${sha512}
    size: ${size}
path: ${zipFilename}
sha512: ${sha512}
releaseDate: '${new Date().toISOString()}'
`;

const ymlPath = join(ROOT, "out/latest-mac.yml");
writeFileSync(ymlPath, yml);
console.log(`Created ${ymlPath}`);

console.log(`Uploading to GitHub release v${version}...`);
try {
  execSync(`gh release upload v${version} "${ymlPath}" --clobber`, {
    cwd: ROOT,
    stdio: "inherit",
  });
  console.log("Done!");
} catch {
  console.error(
    "Failed to upload. Make sure 'gh' CLI is installed and authenticated.",
  );
  process.exit(1);
}
