import type { NextConfig } from "next"
import path from "path"


const mfConfig = {
  name: "editor",
  filename: "static/chunks/remoteEntry.js",
  exposes: {
    "./EditorPage": "./src/app/editor/page.tsx",
  },
  // host가 script injection 방식으로 로드 → shared 불필요
}

const nextConfig: NextConfig = {
  transpilePackages: ["three", "postprocessing", "n8ao"],

  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // remoteEntry.js가 동적 script 주입으로 로드될 때 document.currentScript = null
      // → publicPath를 절대 경로로 명시해야 chunk URL이 올바르게 생성됨
      const selfUrl = process.env.NEXT_PUBLIC_SELF_URL ?? "http://localhost:3001"
      config.output = {
        ...config.output,
        publicPath: `${selfUrl}/_next/`,
      }
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "three$": require.resolve("three"),
      "three/addons": path.resolve(__dirname, "node_modules/three/examples/jsm"),
      "three/examples/jsm": path.resolve(__dirname, "node_modules/three/examples/jsm"),
    }

    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: "asset/resource",
    })

    // Module Federation - server/client 각각 등록
    config.plugins.push(
      new webpack.container.ModuleFederationPlugin({
        ...mfConfig,
        // 서버 빌드에서는 exposes 제외 (CSR only)
        exposes: isServer ? {} : mfConfig.exposes,
      }),
    )

    return config
  },

  turbopack: {
    resolveAlias: {
      three: "three",
      "three/addons": "three/examples/jsm",
      "three/examples/jsm": "three/examples/jsm",
    },
  },
  productionBrowserSourceMaps: false,
}

export default nextConfig
