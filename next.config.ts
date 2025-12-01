import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// リポジトリ名に合わせて変更してください
const repoName = "life-game";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
 output: "export",
  // 画像を使う予定があるなら unoptimized を true にしておくと楽です
  images: {
    unoptimized: true
  },
  // yourname.github.io/life-game でホストする場合
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : ""
};

export default nextConfig;
