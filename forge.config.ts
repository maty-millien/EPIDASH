import { MakerDeb } from "@electron-forge/maker-deb"
import { MakerRpm } from "@electron-forge/maker-rpm"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { MakerZIP } from "@electron-forge/maker-zip"
import { FusesPlugin } from "@electron-forge/plugin-fuses"
import { VitePlugin } from "@electron-forge/plugin-vite"
import type { ForgeConfig } from "@electron-forge/shared-types"
import { FuseV1Options, FuseVersion } from "@electron/fuses"

const config: ForgeConfig = {
  packagerConfig: {
    name: "EPIDASH",
    executableName: "epidash",
    appBundleId: "com.maty.epidash",
    asar: true,
    icon: "./resources/icon",
    protocols: [
      {
        name: "EPIDASH Protocol",
        schemes: ["epidash"]
      }
    ]
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: "EPIDASH",
      setupIcon: "./resources/icon.ico"
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({
      options: {
        icon: "./resources/icon.png"
      }
    }),
    new MakerDeb({
      options: {
        icon: "./resources/icon.png"
      }
    })
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main/main.ts",
          config: "vite.main.config.mts",
          target: "main"
        },
        {
          entry: "src/preload/preload.ts",
          config: "vite.preload.config.mts",
          target: "preload"
        }
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts"
        }
      ]
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ]
}

export default config
